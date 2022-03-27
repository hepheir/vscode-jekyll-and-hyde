import {
    ExtensionContext,
    TreeItem,
} from 'vscode';
import { CategoryNode } from './nodes/categoryNode';
import { CachedNodes } from './nodes/cachedNodes';
import {
    TreeViewBase,
    view,
} from './base';


@view()
export class CategoryView extends TreeViewBase {
    constructor(context: ExtensionContext) {
        super('categoryView');
        context.subscriptions.push(this._view);
    }

    override getRoot() {
        return CachedNodes.categoryNodes;
    }

    override getChildrenOf(element: TreeItem) {
        if (element instanceof CategoryNode) {
            const category = element.label;
            const posts = CachedNodes.postNodes.filter(node => node.page.categories.includes(category));
            const drafts = CachedNodes.draftNodes.filter(node => node.page.categories.includes(category));
            return posts.concat(drafts);
        }
        return [];
    }
}
