import * as vscode from 'vscode';
import { ViewBase } from './viewBase';
import { CategoryNode } from './nodes/categoryNode';
import { CachedNodes } from './nodes/cachedNodes';


export class CategoryView extends ViewBase {
    async getChildren(element?: vscode.TreeItem): Promise<vscode.TreeItem[]> {
        if (element === undefined) {
            return CachedNodes.categoryNodes;
        } else if (element instanceof CategoryNode) {
            const category = element.label;
            const posts = CachedNodes.postNodes.filter(node => node.page.categories.includes(category));
            const drafts = CachedNodes.draftNodes.filter(node => node.page.categories.includes(category));
            return posts.concat(drafts);
        }
        return [];
    }
}
