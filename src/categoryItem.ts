import * as path from 'path';
import { TreeItem, TreeItemCollapsibleState, Uri } from 'vscode';
import { Site } from 'jekyll';


export class CategoryItem extends TreeItem {
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
