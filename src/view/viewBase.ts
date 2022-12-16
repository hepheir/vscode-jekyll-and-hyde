import * as vscode from 'vscode';

export abstract class TreeViewBase<T> {
    protected view: vscode.TreeView<T>;

    constructor(
        protected readonly id: `jekyll-n-hyde.view.${string}`,
        protected readonly treeDataProvider: vscode.TreeDataProvider<T>,
    ) {
        this.view = vscode.window.createTreeView(id, {
            showCollapseAll: true,
            treeDataProvider
        });
    }
}