import * as vscode from 'vscode';
import { ViewBase } from './viewBase';
import { CachedNodes } from './nodes/cachedNodes';


export class PostView extends ViewBase {
    async getChildren(element?: vscode.TreeItem): Promise<vscode.TreeItem[]> {
        return CachedNodes.postNodes;
    }
}
