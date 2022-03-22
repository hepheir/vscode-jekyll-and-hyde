import { TreeDataProvider, TreeItem } from 'vscode';
import { Site } from 'jekyll';
import { JekyllSite } from './jekyllSite';
import { CategoryItem } from './categoryItem';
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
