import * as fs from "fs";
import * as util from "util";
import * as vscode from "vscode";
import { Logger } from "../util/logger";

class FileSystem {
    public static readonly instance = new FileSystem(
        '**/_posts/**/[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]-*.{md,markdown,html}',
        '**/_drafts/**/*.{md,markdown,html}',
    );

    protected onCreateEventEmitter = new vscode.EventEmitter<vscode.Uri[]>();
    protected onDeleteEventEmitter = new vscode.EventEmitter<vscode.Uri[]>();
    protected onChangeEventEmitter = new vscode.EventEmitter<vscode.Uri[]>();

    private readonly globPatterns: string[];
    private readonly logger = new Logger('model.file-system');

    private constructor(...globPatterns: readonly string[]) {
        this.logger.info('initialize');
        this.globPatterns = globPatterns.slice();
        this.createFileSystemWatcher();
    }

    get onCreateEvent() {
        return this.onCreateEventEmitter.event;
    }

    get onDeleteEvent() {
        return this.onDeleteEventEmitter.event;
    }

    get onChangeEvent() {
        return this.onChangeEventEmitter.event;
    }

    get workspaceFolder() {
        if (vscode.workspace.workspaceFolders === undefined) {
            this.logger.error('workspace folder not found');
            throw Error();
        }
        return vscode.workspace.workspaceFolders[0];
    }

    list = async () => {
        this.logger.info('list all');
        const jobs = this.globPatterns.map(globPattern => vscode.workspace.findFiles(globPattern));
        const uris = await Promise.all(jobs).then(uri2dArr => uri2dArr.flat());
        this.logger.info(`found ${uris.length} uris.`);
        return uris;
    }

    write = (uri: vscode.Uri, content: string) => {
        this.logger.info(`writing ${uri.path}`);
        fs.writeFileSync(uri.fsPath, new util.TextEncoder().encode(content));
    }

    read = (uri: vscode.Uri) => {
        this.logger.info(`reading ${uri.path}`);
        return fs.readFileSync(uri.fsPath).toString();
    }

    delete = (uri: vscode.Uri) => {
        this.logger.info(`deleting ${uri.path}`);
        fs.rmSync(uri.fsPath);
    }

    private createFileSystemWatcher = () => {
        this.globPatterns.forEach(globPattern => {
            this.logger.info(`add file system watcher for ${globPattern}`);
            const relPattern = new vscode.RelativePattern(this.workspaceFolder, globPattern);
            const watcher = vscode.workspace.createFileSystemWatcher(relPattern);
            watcher.onDidCreate(uri => {
                this.logger.info(`detect create ${uri.path}`);
                this.onCreateEventEmitter.fire([uri]);
            });
            watcher.onDidChange(uri => {
                this.logger.info(`detect change ${uri.path}`);
                this.onChangeEventEmitter.fire([uri]);
            });
            watcher.onDidDelete(uri => {
                this.logger.info(`detect delete : ${uri.path}`);
                this.onDeleteEventEmitter.fire([uri]);
            });
        });
    }
}

export {
    FileSystem,
}