import * as vscode from 'vscode';

export abstract class TreeViewBase<T> {
    public readonly view: vscode.TreeView<T>;

    constructor(
        public readonly viewId: string,
        public readonly treeDataProvider: vscode.TreeDataProvider<T>,
    ) {
        this.view = vscode.window.createTreeView(viewId, {
            showCollapseAll: true,
            treeDataProvider
        });
    }

    reveal(element: T): void {
        this.view.reveal(element);
    }

    abstract refresh(): void;
}