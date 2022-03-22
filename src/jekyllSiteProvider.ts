import { TreeDataProvider, TreeItem } from 'vscode';


export class JekyllSiteProvider implements TreeDataProvider<TreeItem> {
    getTreeItem(element: TreeItem): TreeItem {
        return element;
    }

    async getChildren(element?: TreeItem): Promise<TreeItem[]> {
        return [];
    }
}
