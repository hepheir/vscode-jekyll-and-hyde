import * as matter from 'gray-matter';
import { FrontMatter } from 'jekyll';
import * as vscode from "vscode";
import { getWorkspaceFolder } from '../../../settings';


export const disposable = vscode.commands.registerCommand('categorizedPosts.item.create', async (content?: string, data?: FrontMatter) => {
    const defaultData: FrontMatter = {
        title: '',
    };

    if (data) {
        Object.assign(defaultData, data);
    }

    const filename = await promptFilename();
    const workspaceFolder = getWorkspaceFolder();

    if (!filename) {
        vscode.window.showInformationMessage("Aborted");
        return;
    };

    const targetUri = vscode.Uri.joinPath(workspaceFolder.uri, '_drafts', filename);
    content = matter.stringify(content ?? '', defaultData);
    // Start editing

    await createFile(targetUri, content);
    await vscode.window.showTextDocument(targetUri);
});


async function promptFilename(): Promise<string | undefined> {
    const DEFAULT_FILENAME = 'untitled.md';
    const filename = await vscode.window.showInputBox({
            placeHolder: 'Enter the name of file',
            value: DEFAULT_FILENAME,
    });
    return filename;
}


async function createFile(uri: vscode.Uri, content: string): Promise<boolean> {
    const workspaceEdit = new vscode.WorkspaceEdit();
    const workspaceEditEntryMetadata: vscode.WorkspaceEditEntryMetadata = {
        label: "New Draft",
        needsConfirmation: false,
        iconPath: new vscode.ThemeIcon('diff-added'),
    };
    workspaceEdit.createFile(uri, { overwrite: false }, workspaceEditEntryMetadata);
    workspaceEdit.insert(uri, new vscode.Position(0, 0), content);
    return await vscode.workspace.applyEdit(workspaceEdit);
}
