import * as vscode from "vscode";
import { CategoryRepository } from "../models/categoryRepository";
import { PostFileReader } from "../models/postFileReader";
import { CategoryDTOBuilder } from "../models/categoryDTOBuilder";
import type { PostDTO } from "../models/postDTO";
import { ReaderError } from "../util/readerError";

export class CategoryRepositorySyncService {
    private readonly _onDidLoad: vscode.EventEmitter<CategoryRepository> = new vscode.EventEmitter();
    private readonly globPatterns = {
        posts: '**/_posts/**/[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]-*.{md,markdown,html}',
        drafts: '**/_drafts/**/*.{md,markdown,html}',
    };
    private _isLoaded: boolean = false;
    private readonly categoryRepository: CategoryRepository = CategoryRepository.instance;

    onDidLoad: vscode.Event<CategoryRepository> = this._onDidLoad.event;

    getRepository = () => {
        return this.categoryRepository;
    };

    isLoaded = () => {
        return this._isLoaded;
    };

    ensureLoaded = async () => {
        if (this._isLoaded) {
            return;
        }
        this.createFSWatchers();
        await this.load();
    };

    load = async () => {
        this.categoryRepository.deleteAll();
        const uris = [
            ...await vscode.workspace.findFiles(this.globPatterns.posts),
            ...await vscode.workspace.findFiles(this.globPatterns.drafts),
        ];
        for (const uri of uris) {
            this.loadPostByUri(uri);
        }
        this._isLoaded = true;
        this._onDidLoad.fire(this.categoryRepository);
    };

    private loadPostByUri = (uri: vscode.Uri) => {
        try {
            const post = new PostFileReader(uri).read();
            if (post.categories.length > 0) {
                this.addPostWithCategory(post);
            } else {
                this.addPostWithoutCategory(post);
            }
        } catch (error) {
            if (error instanceof ReaderError.NotReadableException) {
                console.warn("Not readable data: "+uri.fsPath, error, uri);
            } else {
                throw error;
            }
        }
    };

    private addPostWithCategory = (post: PostDTO) => {
        const tempCategory = new CategoryDTOBuilder()
            .setNames(post.categories)
            .build();
        const categoryId = this.categoryRepository.getId(tempCategory);
        const category = this.categoryRepository.findById(categoryId) ?? tempCategory;
        category.posts.push(post);
        this.categoryRepository.save(category);
    };

    private addPostWithoutCategory = (post: PostDTO) => {
        const root = this.categoryRepository.findRoot();
        root.posts.push(post);
        this.categoryRepository.save(root);
    };

    private createFSWatchers = () => {
        this.createFSWatcherViaGlobPattern(this.globPatterns.posts);
        this.createFSWatcherViaGlobPattern(this.globPatterns.drafts);
    }

    private createFSWatcherViaGlobPattern = (globPattern: string) => {
        const workspaceFolder = vscode.workspace.workspaceFolders![0];
        const relPattern = new vscode.RelativePattern(workspaceFolder, globPattern);
        const watcher = vscode.workspace.createFileSystemWatcher(relPattern);
        watcher.onDidCreate(this.load);
        watcher.onDidChange(this.load);
        watcher.onDidDelete(this.load);
    }
}