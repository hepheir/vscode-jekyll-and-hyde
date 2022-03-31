import * as path from "path";
import * as vscode from "vscode";
import { Entry } from '../../../views/categorizedPosts';


export const disposable = vscode.commands.registerCommand('categorizedPosts.item.rename', async (entry: Entry) => {
    if (!entry.post) return;

    const { dir, base } = path.parse(entry.post.path);

    const newBase = await vscode.window.showInputBox({
        title: 'Rename File',
        placeHolder: base,
    });
    if (!newBase) return;

    const oldUri = vscode.Uri.file(path.join(dir, base));
    const newUri = vscode.Uri.file(path.join(dir, newBase));

    const workspaceEdit = new vscode.WorkspaceEdit();

    workspaceEdit.renameFile(oldUri, newUri, {
        overwrite: false
    });

    await vscode.workspace.applyEdit(workspaceEdit);
});
