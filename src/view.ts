import * as vscode from "vscode";
import { Site, Category, Post } from "./model";


type _TreeItem = Site | Post | Category;


class _TreeDataProvider implements vscode.TreeDataProvider<_TreeItem> {
    private sites: { [name: string]: Site };
    private onDidChangeTreeDataEventEmiiter: vscode.EventEmitter<undefined | _TreeItem | _TreeItem[]>;
    public readonly onDidChangeTreeData;

    constructor() {
        this.sites = {};
        this.onDidChangeTreeDataEventEmiiter = new vscode.EventEmitter();
        this.onDidChangeTreeData = this.onDidChangeTreeDataEventEmiiter.event;
        vscode.workspace.onDidChangeWorkspaceFolders(evt => {
            evt.removed.forEach(this.onDidRemoveWorkspaceFolder, this);
            evt.added.forEach(this.onDidAddWorkspaceFolder, this);
        });
        vscode.workspace.workspaceFolders?.forEach(this.onDidAddWorkspaceFolder, this);
    }

    private onDidAddWorkspaceFolder = async (workspaceFolder: vscode.WorkspaceFolder) => {
        const site = new Site(workspaceFolder);
        const progressOptions: vscode.ProgressOptions = {
            title: "Loading " + site.name,
            location: vscode.ProgressLocation.Notification,
            cancellable: true,
        };
        this.sites[workspaceFolder.name] = site;
        await vscode.window.withProgress(progressOptions, (progress, token) => {
            return site.update((value, index, array) => {
                progress.report({
                    increment: 1 / array.length,
                    message: value.path,
                });
            });
        });
        this.onDidChangeTreeDataEventEmiiter.fire(undefined);
    };

    private onDidRemoveWorkspaceFolder = async (workspaceFolder: vscode.WorkspaceFolder) => {
        delete this.sites[workspaceFolder.name];
        this.onDidChangeTreeDataEventEmiiter.fire(undefined);
    };

    getTreeItem = async (element: _TreeItem) => {
        if (element instanceof Category) {
            return new _CategoryTreeItem(element);
        }
        return new _PostTreeItem(element);
    }

    getParent = async (element: _TreeItem) => {
        return element.parent;
    }

    getChildren = async (element?: _TreeItem) => {
        if (element === undefined) {
            return Object.values(this.sites);
        }
        if (element instanceof Category) {
            return [...Object.values(element.category), ...Object.values(element.post)];
        }
        return [];
    }
}


class _PostTreeItem extends vscode.TreeItem {
    public readonly post: Post;

    constructor(post: Post) {
        super(post.uri);
        this.post = post;
        this.id = post.uri.fsPath;
        this.label = post.title;
        this.resourceUri = post.uri;
        this.iconPath = vscode.ThemeIcon.File;
        this.collapsibleState = vscode.TreeItemCollapsibleState.None;
        this.command = {
            command: 'vscode.open',
            title: "Open File",
            arguments: [post.uri],
        };
    }
}


class _CategoryTreeItem extends vscode.TreeItem {
    public readonly category: Category;

    constructor(category: Category) {
        super(category.name);
        this.category = category;
        this.id = category.path;
        this.label = category.name;
        this.iconPath = vscode.ThemeIcon.Folder;
        this.description = `${category.countPosts(true)} posts`;
        this.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;

        if (category.parent === null) {
            this.iconPath = new vscode.ThemeIcon('folder-library');
        }
    }
}


export const viewOptions: vscode.TreeViewOptions<_TreeItem> = {
    treeDataProvider: new _TreeDataProvider(),
    showCollapseAll: true,
};
