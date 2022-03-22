import { ExtensionContext, workspace } from 'vscode';


export class JekyllExplorer {
    readonly id = 'jekyll-enthusiasm.jekyllExplorer';

    constructor(context: ExtensionContext) {
        const source = workspace.workspaceFolders && workspace.workspaceFolders.length > 0
            ? workspace.workspaceFolders[0].uri.fsPath
            : undefined;

        if (!source) {
            return;
        }
    }
}
