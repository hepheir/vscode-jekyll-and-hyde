import * as vscode from "vscode";
import Page from "../../../models/page";

export default class PageTreeItem extends vscode.TreeItem {
    constructor(readonly page: Page) {
        const uri = vscode.Uri.file(page.path);
        super(uri);
        this.collapsibleState = vscode.TreeItemCollapsibleState.None;
        this.command = { command: 'vscode.open', title: "Open File", arguments: [uri], };
        this.contextValue = 'page';
        this.iconPath = new vscode.ThemeIcon('file-text');
        this.label = page.title;
        this.resourceUri = uri;
    }
}