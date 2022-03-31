import * as vscode from "vscode";
import { Entry } from "../../../views/categorizedPosts";


export const disposable = vscode.commands.registerCommand('categorizedPosts.item.delete', async (entry: Entry) => {
    if (!entry.post) return;
    const uri = vscode.Uri.parse(entry.post.path);
    await vscode.workspace.fs.delete(uri);
    await vscode.commands.executeCommand('categorizedPosts.refresh');
});
