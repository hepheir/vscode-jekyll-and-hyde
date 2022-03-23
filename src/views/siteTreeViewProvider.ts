import { TreeDataProvider, TreeItem } from 'vscode';
import { JekyllSite } from '../jekyllSite';


export class SiteTreeViewProvider implements TreeDataProvider<TreeItem> {
    public site: JekyllSite;

    constructor(site: JekyllSite) {
        this.site = site;
    }

    getTreeItem(element: TreeItem): TreeItem {
        return element;
    }

    async getChildren(element?: TreeItem): Promise<TreeItem[]> {
        throw "Not Implemented Error";
    }
}
