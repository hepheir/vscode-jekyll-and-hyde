import * as vscode from "vscode";


export function getWorkspaceFolder(): vscode.WorkspaceFolder {
    if (!vscode.workspace.workspaceFolders) {
        throw "Unable to resolve current workspace folder";
    }
    return vscode.workspace.workspaceFolders[0];
}
