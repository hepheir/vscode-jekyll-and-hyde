import * as path from 'path';
import { TreeItem, TreeItemCollapsibleState, Uri } from 'vscode';
import { Site, Page } from 'jekyll';


export class PageItem extends TreeItem {
    public site: Site;
    public page: Page;

    constructor(site: Site, page: Page) {
        const uri = Uri.file(page.path);
        const isDraft = page.dir.startsWith('_drafts');

        super(uri);

        this.site = site;
        this.page = page;

        this.label = page.title;
        this.description = page.name;
        this.collapsibleState = TreeItemCollapsibleState.None;
        this.command = {
            command: 'jekyll-n-hyde.jekyllExplorer.openTextDocument',
            title: 'Open Text Document',
            arguments: [uri]
        };
        this.contextValue = 'file';

        if (isDraft) {
            this.iconPath = {
                light: Uri.file(path.join(__filename, '..', '..', 'images', 'draft-light.svg')),
                dark: Uri.file(path.join(__filename, '..', '..', 'images', 'draft-dark.svg'))
            };
        } else {
            this.iconPath = {
                light: Uri.file(path.join(__filename, '..', '..', 'images', 'post-light.svg')),
                dark: Uri.file(path.join(__filename, '..', '..', 'images', 'post-dark.svg'))
            };
        }
    }

    static getAllPageItemsFromCategory(site: Site, category: string): PageItem[] {
        return site.categories[category].map(page => new PageItem(site, page));
    }
}
