import * as vscode from 'vscode';


export class ViewBase implements vscode.TreeDataProvider<vscode.TreeItem> {
    constructor(
        public readonly context: vscode.ExtensionContext,
        private readonly id: string
    ) {
        const view = vscode.window.createTreeView(this.id, { treeDataProvider: this });
        context.subscriptions.push(view);
    }

    public getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
        return element;
    }

    public async getChildren(element?: vscode.TreeItem): Promise<vscode.TreeItem[]> {
        throw "Not Implemented Error";
    }
}
