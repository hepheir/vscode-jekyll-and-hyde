import { commands, ExtensionContext, Uri, workspace, window } from 'vscode';


export class JekyllExplorer {
    readonly id = 'jekyll-n-hyde.jekyllExplorer';

    constructor(context: ExtensionContext) {
        const source = workspace.workspaceFolders && workspace.workspaceFolders.length > 0
            ? workspace.workspaceFolders[0].uri.fsPath
            : undefined;

        if (!source) {
            return;
        }

        commands.registerCommand('jekyll-n-hyde.jekyllExplorer.openTextDocument', async (resource) => this.openResource(resource));
    }

    private openResource(resource: Uri): void {
        window.showTextDocument(resource);
    }
}
