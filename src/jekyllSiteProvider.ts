import { TreeDataProvider, TreeItem, TreeItemCollapsibleState, Uri } from 'vscode';
import { Site, Page } from 'jekyll';


export class JekyllSiteProvider implements TreeDataProvider<TreeItem> {
    getTreeItem(element: TreeItem): TreeItem {
        return element;
    }

    async getChildren(element?: TreeItem): Promise<TreeItem[]> {
        return [];
    }
}


class PageItem extends TreeItem {
    public site: Site;
    public page: Page;

    constructor(site: Site, page: Page) {
        const uri = Uri.file(page.path);

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
    }

    static getAllCategoryItemsFromSite(site: Site): CategoryItem[] {
        const categories = Object.keys(site.categories);
        const categoryItems = categories.map(category => new CategoryItem(site, category));
        return categoryItems.sort((a, b) => a.category.localeCompare(b.category));
    }
}
