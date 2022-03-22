import { commands, ExtensionContext, Uri, workspace, window } from 'vscode';
import { JekyllSiteProvider } from './jekyllSiteProvider';


export class JekyllExplorer {
    readonly id = 'jekyll-n-hyde.jekyllExplorer';

    constructor(context: ExtensionContext) {
        const source = workspace.workspaceFolders && workspace.workspaceFolders.length > 0
            ? workspace.workspaceFolders[0].uri.fsPath
            : undefined;

        if (!source) {
            return;
        }

        const treeDataProvider = new JekyllSiteProvider(source);
        const view = window.createTreeView('jekyll-n-hyde.jekyllExplorer', { treeDataProvider });

        context.subscriptions.push(view);

        commands.registerCommand('jekyll-n-hyde.jekyllExplorer.openTextDocument', async (resource) => this.openResource(resource));
    }

    private openResource(resource: Uri): void {
        window.showTextDocument(resource);
    }
}
