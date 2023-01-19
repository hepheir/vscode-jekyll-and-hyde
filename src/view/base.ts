import * as vscode from 'vscode';

abstract class TreeViewBase<T> {
    public readonly view: vscode.TreeView<T>;

    constructor(
        public readonly viewId: string,
        public readonly treeDataProvider: vscode.TreeDataProvider<T>,
        public readonly treeViewOption: vscode.TreeViewOptions<T> = {
            showCollapseAll: true,
            treeDataProvider
        },
    ) {
        this.view = vscode.window.createTreeView(viewId, this.treeViewOption);
    }

    reveal(element: T): void {
        this.view.reveal(element);
    }

    abstract refresh(): void;
}

class TreeFolderItem extends vscode.TreeItem {
    constructor(label: string) {
        super(label);
        this.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
        this.iconPath = vscode.ThemeIcon.Folder;
    }
}

class TreeFileItem extends vscode.TreeItem {
    constructor(label: string, uri: vscode.Uri) {
        super(label);
        this.resourceUri = uri;
        this.collapsibleState = vscode.TreeItemCollapsibleState.None;
        this.iconPath = vscode.ThemeIcon.File;
        this.command = {
            command: 'vscode.open',
            title: "Open File",
            arguments: [uri],
        };
    }
}

export {
    TreeViewBase,
    TreeFolderItem,
    TreeFileItem,
}