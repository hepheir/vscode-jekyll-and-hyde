import * as path from 'path';
import { TreeItem, TreeItemCollapsibleState, Uri } from 'vscode';
import { Page } from 'jekyll';


export class PageNode extends TreeItem {
    constructor(page: Page) {
        const uri = Uri.file(page.path);

        super(uri);

        this.label = page.title;
        this.description = page.name;
        this.collapsibleState = TreeItemCollapsibleState.None;
        this.command = {
            command: 'jekyll-n-hyde.jekyllExplorer.openTextDocument',
            title: 'Open Text Document',
            arguments: [uri]
        };
        this.contextValue = 'file';
        this.iconPath = {
            light: Uri.file(path.join(__filename, '..', '..', 'images', 'post-light.svg')),
            dark: Uri.file(path.join(__filename, '..', '..', 'images', 'post-dark.svg'))
        };
    }
}
