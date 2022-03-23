import * as path from 'path';
import { TreeItem, TreeItemCollapsibleState, Uri } from 'vscode';
import { Page } from 'jekyll';


export class CategoryNode extends TreeItem {
    constructor(label: string, posts: Page[], drafts: Page[]) {
        super(label);

        this.label = label;
        this.description = `${posts.length} posts, ${drafts.length} drafts`;
        this.collapsibleState = TreeItemCollapsibleState.Collapsed;
        this.iconPath = {
            light: Uri.file(path.join(__filename, '..', '..', 'images', 'category-light.svg')),
            dark: Uri.file(path.join(__filename, '..', '..', 'images', 'category-dark.svg'))
        };
    }
}
