import { ExtensionContext, TreeDataProvider, TreeItem, window } from 'vscode';


export class ViewBase implements TreeDataProvider<TreeItem> {
    constructor(
        public readonly context: ExtensionContext,
        private readonly id: string
    ) {
        const view = window.createTreeView(this.id, { treeDataProvider: this });
        context.subscriptions.push(view);
    }

    getTreeItem(element: TreeItem): TreeItem {
        return element;
    }

    async getChildren(element?: TreeItem): Promise<TreeItem[]> {
        throw "Not Implemented Error";
    }
}
