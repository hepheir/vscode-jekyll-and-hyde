import * as vscode from "vscode";
import * as matter from "gray-matter"
import Page from "../../../models/page";
import Category from "../../../models/category";
import { TextEncoder } from "util";

export default async function moveCategory(post: Page, category: Category) {
    const uri = vscode.Uri.file(post.path);
    const file = matter.read(uri.fsPath);
    file.data.categories = category.toStringArray();
    const content = matter.stringify(file, file.data);
    const encoder = new TextEncoder();
    const workspaceEdit: vscode.WorkspaceEdit = new vscode.WorkspaceEdit();
    const workspaceEditEntryMetadata: vscode.WorkspaceEditEntryMetadata = {
        label: "Move Category",
        needsConfirmation: false,
        iconPath: new vscode.ThemeIcon("diff-added"),
    };
    workspaceEdit.createFile(uri, { contents: encoder.encode(content), overwrite: true }, workspaceEditEntryMetadata);
    await vscode.workspace.applyEdit(workspaceEdit);
    await vscode.window.showTextDocument(uri);
}
