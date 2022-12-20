import * as vscode from "vscode";
import type { CategoryDTO } from "./categoryDTO";

export class CategoryTreeItem extends vscode.TreeItem {
    constructor(
        public readonly category: CategoryDTO
    ) {
        const lastName = category.names[category.names.length-1];
        super(lastName);
        this.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
        this.iconPath = vscode.ThemeIcon.Folder;
        this.description = `(${this.getPostCountRecursive(category)})`;
    }

    private getPostCountRecursive = (category: CategoryDTO) => {
        let count = category.posts.length;
        for (const subcategory of category.categories) {
            count += this.getPostCountRecursive(subcategory);
        }
        return count;
    }
}