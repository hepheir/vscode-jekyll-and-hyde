import * as path from 'path';
import * as vscode from 'vscode';
import { Page } from 'jekyll';


export class CategoryNode extends vscode.TreeItem {
    constructor(
        private readonly context: vscode.ExtensionContext,
        public label: string,
        public readonly posts: Page[],
        public readonly drafts: Page[]
    ) {
        super(label);

        this.label = label;
        this.description = `${posts.length} posts, ${drafts.length} drafts`;
        this.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
        this.iconPath = {
            light: vscode.Uri.file(this.context.asAbsolutePath(path.join('images', 'category-light.svg'))),
            dark: vscode.Uri.file(this.context.asAbsolutePath(path.join('images', 'category-dark.svg')))
        };
    }
}
