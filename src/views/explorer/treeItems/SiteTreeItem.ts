import * as vscode from "vscode";
import Category from "../../../models/category";
import CategoryTreeItem from "./CategoryTreeItem";

export default class SiteTreeItem extends CategoryTreeItem {
    constructor(category: Category) {
        super(category);
        this.iconPath = new vscode.ThemeIcon('folder-library');
    }
}