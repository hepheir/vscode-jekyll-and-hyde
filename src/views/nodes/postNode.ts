import * as path from 'path';
import * as vscode from 'vscode';
import { Page } from 'jekyll';


export class PostNode extends vscode.TreeItem {
    constructor(context: vscode.ExtensionContext, page: Page) {
        const uri = vscode.Uri.file(page.path);

        super(uri);

        this.label = page.title;
        this.description = page.name;
        this.collapsibleState = vscode.TreeItemCollapsibleState.None;
        this.command = {
            command: 'showTextDocument',
            title: 'Open Text Document',
            arguments: [uri]
        };
        this.contextValue = 'file';
        this.iconPath = {
            light: vscode.Uri.file(context.asAbsolutePath(path.join('images', 'post-light.svg'))),
            dark: vscode.Uri.file(context.asAbsolutePath(path.join('images', 'post-dark.svg')))
        };
    }
}
