import * as matter from 'gray-matter';
import * as vscode from "vscode";
import { Entry } from "../../../views/categorizedPosts";


vscode.commands.registerCommand('categorizedPosts.item.updateLastMod', async (entry: Entry) => {
    if (!entry.post) return;

    const uri = vscode.Uri.file(entry.post.path);
    const buffer = await vscode.workspace.fs.readFile(uri);

    const file = matter(buffer.toString());
    file.data.last_modified_at = new Date(Date.now());

    const content = matter.stringify(file.content, file.data);

    await vscode.workspace.fs.writeFile(uri, Buffer.from(content));
    await vscode.window.showTextDocument(uri);
});
