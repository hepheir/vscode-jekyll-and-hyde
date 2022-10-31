import * as vscode from "vscode";

export default class CategoryTreeItem extends vscode.TreeItem {
    constructor(category: string) {
        const label = category;
        super(label);
        this.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
        this.contextValue = 'category';
        this.iconPath = new vscode.ThemeIcon('archive');
        this.label = label;
        this.description = '';
    }
}