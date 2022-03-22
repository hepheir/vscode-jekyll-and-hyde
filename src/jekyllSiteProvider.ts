import * as path from 'path';
import { TreeDataProvider, TreeItem, TreeItemCollapsibleState, Uri } from 'vscode';
import { Site, Page } from 'jekyll';
import { JekyllSite } from './jekyllSite';


export class JekyllSiteProvider implements TreeDataProvider<TreeItem> {
    private site: Site;

    constructor(readonly source: string) {
        this.site = new JekyllSite(source);
    }

    getTreeItem(element: TreeItem): TreeItem {
        return element;
    }

    async getChildren(element?: TreeItem): Promise<TreeItem[]> {
        if (element === undefined) {
            return CategoryItem.getAllCategoryItemsFromSite(this.site);
        } else if (element instanceof CategoryItem) {
            return PageItem.getAllPageItemsFromCategory(element.site, element.category);
        } else {
            return [new TreeItem('Unexpected type')];
        }
    }
}


class PageItem extends TreeItem {
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
            command: 'jekyll-enthusiasm.jekyllExplorer.openTextDocument',
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


class CategoryItem extends TreeItem {
    public site: Site;
    public category: string;

    constructor(site: Site, category: string) {
        super(category);

        this.site = site;
        this.category = category;

        this.label = category;
        this.description = `${site.categories[category].length} posts`;
        this.collapsibleState = TreeItemCollapsibleState.Collapsed;
        this.iconPath = {
            light: Uri.file(path.join(__filename, '..', '..', 'images', 'category-light.svg')),
            dark: Uri.file(path.join(__filename, '..', '..', 'images', 'category-dark.svg'))
        };
    }

    static getAllCategoryItemsFromSite(site: Site): CategoryItem[] {
        const categories = Object.keys(site.categories);
        const categoryItems = categories.map(category => new CategoryItem(site, category));
        return categoryItems.sort((a, b) => a.category.localeCompare(b.category));
    }
}
