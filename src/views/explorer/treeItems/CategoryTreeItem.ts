import * as vscode from "vscode";
import Category from "../../../models/category";

export default class CategoryTreeItem extends vscode.TreeItem {
    constructor(category: Category) {
        super(category.label);
        this.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
        this.contextValue = 'category';
        this.iconPath = new vscode.ThemeIcon('archive');
        this.label = category.label;
        this.description = '';
    }
}