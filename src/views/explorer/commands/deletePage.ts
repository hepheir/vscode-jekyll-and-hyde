import * as vscode from "vscode";
import Page from "../../../models/page";
import FileSystemPage from "../../../models/fileSystemPage";

export default async function deletePage(page: Page) {
    if (page instanceof FileSystemPage) {
        vscode.workspace.fs.delete(page.uri, { useTrash: true });
    }
}
