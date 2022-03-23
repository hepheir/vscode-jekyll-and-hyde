import * as path from 'path';
import * as vscode from 'vscode';
import { Page } from 'jekyll';


export class CategoryNode extends vscode.TreeItem {
    constructor(
        private readonly context: vscode.ExtensionContext,
        public label: string,
        public readonly numberOfPosts: number,
        public readonly numberOfDrafts: number
    ) {
        super(label);

        this.label = label;
        this.description = `${numberOfPosts} posts, ${numberOfDrafts} drafts`;
        this.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
        this.iconPath = {
            light: vscode.Uri.file(this.context.asAbsolutePath(path.join('images', 'category-light.svg'))),
            dark: vscode.Uri.file(this.context.asAbsolutePath(path.join('images', 'category-dark.svg')))
        };
    }
}
