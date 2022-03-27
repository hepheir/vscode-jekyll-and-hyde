import {
    ExtensionContext,
    TreeItem,
} from 'vscode';
import { CachedNodes } from './nodes/cachedNodes';
import {
    TreeViewBase,
    view,
} from './base';


@view()
export class PageView extends TreeViewBase {
    constructor(context: ExtensionContext) {
        super('pageView');
        context.subscriptions.push(this._view);
    }

    override getRoot() {
        return CachedNodes.pageNodes;
    }

    override getChildrenOf(element: TreeItem) {
        return [];
    }
}
