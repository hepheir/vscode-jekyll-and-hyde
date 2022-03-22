import { TreeDataProvider, TreeItem, TreeItemCollapsibleState } from 'vscode';
import { Site } from 'jekyll';


export class JekyllSiteProvider implements TreeDataProvider<TreeItem> {
    getTreeItem(element: TreeItem): TreeItem {
        return element;
    }

    async getChildren(element?: TreeItem): Promise<TreeItem[]> {
        return [];
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
