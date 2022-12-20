import * as vscode from "vscode";
import type { CategoryDTO } from "../../models/category/categoryDTO";
import type { CategoryRepository } from "../../models/category/categoryRepository";
import type { RepositorySyncService } from "../repositorySyncService";
import { PostFileReader } from "../../models/post/postFileReader";
import { CategoryDTOBuilder } from "../../models/category/categoryDTOBuilder";
import { PostDTO } from "../../models/post/postDTO";
import { ReaderError } from "../../models/readerError";

export class CategoryRepositorySyncService implements RepositorySyncService<CategoryDTO, CategoryRepository> {
    private readonly _onDidLoad: vscode.EventEmitter<CategoryRepository> = new vscode.EventEmitter();
    private readonly globPatterns = {
        posts: '**/_posts/**/[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]-*.{md,markdown,html}',
        drafts: '**/_drafts/**/*.{md,markdown,html}',
    };
    private _isLoaded: boolean = false;

    constructor(
        private readonly categoryRepository: CategoryRepository,
    ) { }

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
                console.warn("Not readable data.", error, uri);
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