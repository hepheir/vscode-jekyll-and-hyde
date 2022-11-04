import * as vscode from "vscode";
import Category from "../../../models/category";

export default class CategoryTreeItem extends vscode.TreeItem {
    constructor(category: Category) {
        super(category.label);
        this.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
        this.contextValue = 'category';
        this.iconPath = vscode.ThemeIcon.Folder;
        this.label = category.label;
        this.description = `(${category.size})`;
    }
}