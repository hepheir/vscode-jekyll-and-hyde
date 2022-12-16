import * as vscode from "vscode";
import type { CategoryDTO } from "./categoryDTO";

export class CategoryTreeItem extends vscode.TreeItem {
    constructor(
        public readonly category: CategoryDTO
    ) {
        super(category.name);
        this.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
        this.iconPath = vscode.ThemeIcon.Folder;
        this.description = `(${category.posts.length})`;
    }
}