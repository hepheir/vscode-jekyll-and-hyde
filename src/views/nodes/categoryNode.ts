import * as path from 'path';
import * as vscode from 'vscode';
import { Page } from 'jekyll';


export class CategoryNode extends vscode.TreeItem {
    constructor(context: vscode.ExtensionContext, label: string, posts: Page[], drafts: Page[]) {
        super(label);

        this.label = label;
        this.description = `${posts.length} posts, ${drafts.length} drafts`;
        this.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
        this.iconPath = {
            light: vscode.Uri.file(context.asAbsolutePath(path.join('images', 'category-light.svg'))),
            dark: vscode.Uri.file(context.asAbsolutePath(path.join('images', 'category-dark.svg')))
        };
    }
}
