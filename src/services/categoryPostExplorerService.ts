import * as vscode from "vscode";
import type { CategoryDTO } from "../models/category/categoryDTO";
import type { PostDTO } from "../models/post/postDTO";
import { CategoryService } from "./categoryService";
import { PostService } from "./postService";

export class CategoryPostExplorerService {
    private readonly globPatterns = {
        posts: '**/_posts/**/[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]-*.{md,markdown,html}',
        drafts: '**/_drafts/**/*.{md,markdown,html}',
    };
    private readonly _onDidLoad = new vscode.EventEmitter<vscode.Uri[]>();
    private postService: PostService = new PostService();
    private categoryService: CategoryService = new CategoryService(this.postService);
    private isLoaded = false;

    onDidLoad: vscode.Event<vscode.Uri[]> = this._onDidLoad.event;

    getRoot(): (CategoryDTO | PostDTO)[] {
        return this.categoryService.list().slice();
    }

    async ensureLoaded() {
        if (this.isLoaded) {
            return;
        }
        await this.load();
        this.createFSWatchers();
        this.isLoaded = true;
    }

    async load() {
        const uris = await this.loadAllPostUris();
        for (const uri of uris) {
            try {
                const post = this.postService.add(uri);
                post.categories.forEach(name => {
                    const category = this.categoryService.find(name) ?? this.categoryService.create(name);
                    this.categoryService.addPost(category.name, post);
                })
            } catch (error) {
                console.error(error, uri);
            }
        }
        this._onDidLoad.fire(uris);
    }

    private async loadAllPostUris(): Promise<vscode.Uri[]> {
        return await Promise.all(
            Object.values(this.globPatterns)
                .map(glob => vscode.workspace.findFiles(glob))
        )
        .then(uri2dArr => uri2dArr.flat());
    }

    private createFSWatchers() {
        for (const globPattern of Object.values(this.globPatterns)) {
            const watcher = this.createFSWatcherViaGlobPattern(globPattern);
            this.initFSWatcher(watcher);
        }
    }

    private createFSWatcherViaGlobPattern(globPattern: string): vscode.FileSystemWatcher {
        const workspaceFolder = vscode.workspace.workspaceFolders![0];
        const relPattern = new vscode.RelativePattern(workspaceFolder, globPattern);
        return vscode.workspace.createFileSystemWatcher(relPattern);
    }

    private initFSWatcher(watcher: vscode.FileSystemWatcher) {
        watcher.onDidCreate(this.load);
        watcher.onDidChange(this.load);
        watcher.onDidDelete(this.load);
    }
}