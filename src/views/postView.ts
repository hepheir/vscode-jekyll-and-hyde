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
export class PostView extends TreeViewBase {
    constructor(context: ExtensionContext) {
        super('postView');
        context.subscriptions.push(this._view);
    }

    override getRoot() {
        return CachedNodes.postNodes;
    }

    override getChildrenOf(element: TreeItem) {
        return [];
    }
}
