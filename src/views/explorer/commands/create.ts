import * as fs from "fs";
import * as vscode from "vscode";
import * as matter from "gray-matter"
import { Category, ExplorerTreeData, isCategory } from "../treeData";

export default function create(treeData: ExplorerTreeData) {
    const title = 'untitled';
    const uri = generatePostUri(title);
    const data = generateFrontMatter(isCategory(treeData) ? treeData : undefined);
    const content = matter.stringify({ content: '' }, data);
    createFileViaWorkspaceEdit(uri, content);
}

function generatePostUri(title: string): vscode.Uri {
    let i = 0;
    let uri: vscode.Uri;
    const workspaceFolder = vscode.workspace.workspaceFolders![0];
    while (true) {
        const altTitle = title + (i > 0 ? ' ('+i.toString()+')' : '');
        const basename = generateBasename(altTitle);
        uri = vscode.Uri.joinPath(workspaceFolder.uri, '_posts', basename);
        if (!fileExists(uri)) {
            break;
        }
        i++;
    }
    return uri;
}

function fileExists(uri: vscode.Uri): boolean {
    try {
        const stat = fs.statSync(uri.fsPath);
    } catch (error) {
        return false;
    }
    return true;
}

function generateBasename(title: string): string {
    const date = new Date();
    return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}-${title}.md`;
}

function pad(x: number): string {
    if (x < 10) {
        return '0'+x.toString();
    }
    return x.toString();
}

function generateFrontMatter(category?: Category) {
    const data: { title: string, categories: string[], published: boolean } = {
        title: 'Untitled',
        categories: [],
        published: false,
    };
    if (category !== undefined) {
        data.categories.push(category);
    }
    return data;
}

async function createFileViaWorkspaceEdit(uri: vscode.Uri, content: string) {
    const workspaceEdit: vscode.WorkspaceEdit = new vscode.WorkspaceEdit();
    const workspaceEditEntryMetadata: vscode.WorkspaceEditEntryMetadata = {
        label: "New Draft",
        needsConfirmation: false,
        iconPath: new vscode.ThemeIcon("diff-added"),
    };
    workspaceEdit.createFile(uri, { overwrite: false }, workspaceEditEntryMetadata);
    workspaceEdit.insert(uri, new vscode.Position(0, 0), content);
    await vscode.workspace.applyEdit(workspaceEdit);
    await vscode.window.showTextDocument(uri);
}