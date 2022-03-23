import { TreeDataProvider, TreeItem } from 'vscode';
import { Site } from 'jekyll';
import { JekyllSite } from './jekyllSite';
import { CategoryNode } from './views/nodes/categoryNode';
import { PageNode } from './views/nodes/pageNode';


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
            return CategoryNode.getAllCategoryItemsFromSite(this.site);
        } else if (element instanceof CategoryNode) {
            return PageNode.getAllPageItemsFromCategory(element.site, element.category);
        } else {
            return [new TreeItem('Unexpected type')];
        }
    }
}
