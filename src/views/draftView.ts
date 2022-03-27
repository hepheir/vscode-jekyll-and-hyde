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
export default class DraftView extends TreeViewBase {
    constructor(context: ExtensionContext) {
        super('draftView');
        context.subscriptions.push(this._view);
    }

    override getRoot() {
        return CachedNodes.draftNodes;
    }

    override getChildrenOf(element: TreeItem) {
        return [];
    }
}
