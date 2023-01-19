import * as vscode from "vscode";
import { TreeFileItem, TreeFolderItem, TreeViewBase } from "./base";
import { Category, CategoryRepository } from "../model/category";
import { Page, PageRepository } from "../model/page";

class CategoryTreeItem extends TreeFolderItem {
    constructor(category: Category) {
        super(category.getDisplayName());
        this.description = `(${category.count()})`;
        this.contextValue = 'jekyll-n-hyde.view.categories.category';
    }
}

class PostTreeItem extends TreeFileItem {
    constructor(post: Page) {
        super(post.title, post.uri);
        this.description = post.name;
        this.contextValue = post.published
            ? "jekyll.view.categories.post.published"
            : "jekyll.view.categories.post.unpublished";
    }
}

class CategoriesTreeDataProvider implements vscode.TreeDataProvider<Category | Page> {
    public static instance = new CategoriesTreeDataProvider();

    private readonly onDidChangeTreeDataEventEmiiter: vscode.EventEmitter<undefined> = new vscode.EventEmitter();
    private readonly globPatterns = {
        posts: '**/_posts/**/[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]-*.{md,markdown,html}',
        drafts: '**/_drafts/**/*.{md,markdown,html}',
    };

    private constructor() {
        console.log(`initializing categories-tree-data-provider.`);
        this.createFSWatchers();
        this.load();
    }

    refresh() {
        this.onDidChangeTreeDataEventEmiiter.fire(undefined);
    }

    private getWorkspaceFolder(): vscode.WorkspaceFolder {
        if (vscode.workspace.workspaceFolders === undefined) {
            console.warn(`could not initialize jekyll-n-hyde: workspace folder not found.`);
            throw Error();
        }
        return vscode.workspace.workspaceFolders[0];
    }

    private createFSWatchers = () => {
        console.log(`registering file system watchers for posts...`);
        this.createFSWatcherViaGlobPattern(this.globPatterns.posts);
        console.log(`registering file system watchers for drafts...`);
        this.createFSWatcherViaGlobPattern(this.globPatterns.drafts);
        console.log(`done registering file system watchers.`);
    }

    private createFSWatcherViaGlobPattern = (globPattern: string) => {
        const workspaceFolder = this.getWorkspaceFolder();
        const relPattern = new vscode.RelativePattern(workspaceFolder, globPattern);
        const watcher = vscode.workspace.createFileSystemWatcher(relPattern);
        watcher.onDidCreate(this.load);
        watcher.onDidChange(this.load);
        watcher.onDidDelete(this.load);
    }

    private load = async () => {
        console.log(`clearing cached posts and categories.`);
        CategoryRepository.instance.deleteAll();
        PageRepository.instance.deleteAll();
        console.log(`retrieving post uris.`);
        const uris = [
            ...await vscode.workspace.findFiles(this.globPatterns.posts),
            ...await vscode.workspace.findFiles(this.globPatterns.drafts),
        ];
        console.log(`${uris.length} posts found.`);
        console.log(`start parsing posts and categories.`);
        for (const uri of uris) {
            try {
                const page = new Page(uri);
                page.read();
                PageRepository.instance.save(page);
            } catch (e) {
                console.error(`failed to read post from <${uri.path}>.`);
            }
        }
        console.log(`done loading posts and categories.`);
        this.onDidChangeTreeDataEventEmiiter.fire(undefined);
    };

    onDidChangeTreeData = this.onDidChangeTreeDataEventEmiiter.event;

    getTreeItem(element: Category | Page): vscode.TreeItem | Thenable<vscode.TreeItem> {
        if (element instanceof Category) {
            return new CategoryTreeItem(element);
        }
        if (element instanceof Page) {
            return new PostTreeItem(element);
        }
        throw new TypeError();
    }

    getChildren(element?: Category | Page | undefined): vscode.ProviderResult<(Category | Page)[]> {
        if (element instanceof Category) {
            return [
                ...element.categories,
                ...element.posts,
            ];
        }
        if (element instanceof Page) {
            return [];
        }
        return this.getChildren(CategoryRepository.instance.findRoot());
    }

    getParent(element: Category | Page): vscode.ProviderResult<Category> {
        if (element instanceof Category) {
            return CategoryRepository.instance.findParent(element);
        }
        if (element instanceof Page) {
            return CategoryRepository.instance.findById(new Category(element.categories).getId());
        }
        throw new TypeError();
    }
}

class CategoriesView extends TreeViewBase<Category | Page> {
    private static instance?: CategoriesView;

    public static use() {
        CategoriesView.instance = new CategoriesView();
    }

    public static getInstance(): CategoriesView {
        if (CategoriesView.instance === undefined) {
            throw new Error(`${CategoriesView.name} is not used.`);
        }
        return CategoriesView.instance;
    }

    private constructor() {
        console.log(`initializing categories-tree-view.`);
        super('jekyll-n-hyde.view.categories', CategoriesTreeDataProvider.instance);
    }

    refresh() {
        CategoriesTreeDataProvider.instance.refresh();
    }
}

export default CategoriesView;