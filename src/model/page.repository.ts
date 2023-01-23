import * as vscode from "vscode";
import * as matter from "gray-matter";
import { Logable, Logger } from "../util/logger";
import { FileSystem } from "./fs";
import { Page } from "./page";
import { ObservableArrayRepository } from "../util/repository.implement";

export class PageRepository extends ObservableArrayRepository<Page> implements Logable {
    public static readonly instance = new PageRepository();

    private readonly fileSystem = FileSystem.instance;
    public logger = new Logger('model.page.repository');

    private constructor() {
        super();
        this.logger.info(`initialize.`);
        this.subscribeFileSystem();
        this.loadFromFileSystem();
    }

    reload = () => {
        this.logger.info('reloading.');
        this.clear();
        this.loadFromFileSystem();
    }

    toString = () => {
        return '<PageRepository>';
    }

    private subscribeFileSystem = () => {
        this.logger.info('subscribe file system');
        this.fileSystem.onCreateEvent(this.saveFiles);
        this.fileSystem.onChangeEvent(this.saveFiles);
        this.fileSystem.onDeleteEvent(this.deleteFiles);
    }

    private loadFromFileSystem = () => {
        this.logger.info(`load all pages from file system.`);
        this.fileSystem.list().then(this.saveFiles);
    }

    private saveFiles = (uris: vscode.Uri[]) => {
        this.logger.info(`notified by ${FileSystem.name} : ${uris.length} uris saved.`);
        uris.forEach(uri => {
            try {
                const frontmatter = this.readFrontmatterFrom(uri);
                this.save(new Page(uri, frontmatter));
            } catch (error) {
                this.logger.error(error);
            }
        })
        this.notify();
        this.logger.info('successfully saved.');
    }

    private deleteFiles = (uris: vscode.Uri[]) => {
        this.logger.info(`notified by file system : ${uris.length} uris deleted.`);
        uris.forEach(uri => {
            this.findById(Page.predictId(uri)).ifPresent(this.delete);
        })
        this.notify();
        this.logger.info('successfully deleted.');
    }

    private readFrontmatterFrom(uri: vscode.Uri) {
        return matter(this.fileSystem.read(uri)).data;
    }
}