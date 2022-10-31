import * as vscode from "vscode";
import Page from "../../../models/page";
import PageTreeItem from "./PageTreeItem";

export default class DraftTreeItem extends PageTreeItem {
    constructor(readonly page: Page) {
        super(page);
        this.contextValue = 'draft';
        this.iconPath = new vscode.ThemeIcon('microscope');
    }
}