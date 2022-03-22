import * as path from 'path';
import { TreeDataProvider, TreeItem, TreeItemCollapsibleState, Uri } from 'vscode';
import { Site } from 'jekyll';
import { JekyllSite } from './jekyllSite';
import { PageItem } from './pageItem';


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
