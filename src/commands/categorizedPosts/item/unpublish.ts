import * as vscode from "vscode";
import { Publisher } from '../../../models/Publisher';
import { Entry } from "../../../views/categorizedPosts";


vscode.commands.registerCommand('categorizedPosts.item.unpublish', async (entry: Entry) => {
    if (!entry.post) return;
    return await Promise.resolve().then(async () => {
        const post = entry.post!;
        const draftUri = await Publisher.unpublish(post);
        await vscode.window.showTextDocument(draftUri);
    }).catch().then(async () => {
        await vscode.commands.executeCommand('categorizedPosts.refresh');
    });
});
