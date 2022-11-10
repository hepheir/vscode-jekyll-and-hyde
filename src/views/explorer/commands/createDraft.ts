import * as fs from "fs";
import * as path from "path";
import * as util from "util";
import * as vscode from "vscode";
import * as matter from "gray-matter"
import Category from "../../../models/category";
import { raiseException } from "../../../exceptions";

export default async function createDraft(category: Category) {
    try {
        checkValidCategory(category);
        const title = await getUserInput();
        const uri = generateUniqueUri(title);
        const content = generateContent(title, category);
        await createFileViaWorkspaceEdit(uri, content);
    } catch (error) {
        console.warn(error);
    }
}

function checkValidCategory(category: Category) {
    if (category instanceof Category) return;
    raiseException();
}

async function getUserInput(): Promise<string> {
    const options: vscode.InputBoxOptions = {
        title: 'Create a new draft',
        prompt: 'Enter the title of the draft',
        validateInput,
    }
    const userInput = await vscode.window.showInputBox(options);
    if (userInput === undefined) {
        raiseException();
    }
    return userInput!;
}

function validateInput(title: string): vscode.InputBoxValidationMessage | undefined {
    const uri: vscode.Uri = generateUri(title);
    const uniqueUri: vscode.Uri = generateUniqueUri(title);
    if (uri.path != uniqueUri.path || title != escapeFilename(title)) {
        return {
            message: 'Your file name will be: ' + path.basename(uniqueUri.path),
            severity: vscode.InputBoxValidationSeverity.Warning,
        };
    }
}

function generateUniqueUri(title: string): vscode.Uri {
    let uri: vscode.Uri = generateUri(title);
    for (let i = 0; fs.existsSync(uri.fsPath); i++) {
        uri = generateUri(addNumbering(title, i));
    }
    return uri;
}

function addNumbering(title: string, nth: number): string {
    return (nth == 0) ? title : title + ' (' + nth.toString() + ')';
}

function generateUri(title: string): vscode.Uri {
    const workspaceFolder: string | undefined = vscode.workspace.workspaceFolders?.[0].uri.path;
    if (!workspaceFolder) {
        raiseException();
    }
    const basename = generateBasename(title);
    return vscode.Uri.file(path.join(workspaceFolder!, '_drafts', basename));
}

function generateBasename(title: string) {
    // const date = new Date();
    const ext = '.md';
    const basename = [
        // pad(date.getFullYear()),
        // pad(date.getMonth()+1),
        // pad(date.getDate()),
        escapeFilename(title)
    ].join('-');
    return basename + ext;
}

function pad(x: number): string {
    return (x < 10) ? ('0'+x.toString()) : x.toString();
}

function escapeFilename(value: string): string {
    return value.replace(/[^\w-\(\)]/g, '-').toLowerCase();
}

function generateContent(title: string, category: Category): Uint8Array {
    const data = generateFrontMatter(title, category);
    const stringifiedContent: string = matter.stringify({ content: '' }, data);
    return new util.TextEncoder().encode(stringifiedContent);
}

function generateFrontMatter(title: string, category: Category) {
    return {
        title,
        categories: category.toStringArray(),
        date: new Date().toISOString(),
    };
}

async function createFileViaWorkspaceEdit(uri: vscode.Uri, content: Uint8Array) {
    const workspaceEdit: vscode.WorkspaceEdit = new vscode.WorkspaceEdit();
    const workspaceEditEntryMetadata: vscode.WorkspaceEditEntryMetadata = {
        label: "New Draft",
        needsConfirmation: false,
        iconPath: new vscode.ThemeIcon("diff-added"),
    };
    const options: {
        readonly overwrite?: boolean | undefined;
        readonly ignoreIfExists?: boolean | undefined;
        readonly contents?: Uint8Array | undefined;
    } = {
        overwrite: false,
        contents: content
    };
    workspaceEdit.createFile(uri, options, workspaceEditEntryMetadata);
    if (!await vscode.workspace.applyEdit(workspaceEdit)) {
        raiseException();
    }
    await vscode.window.showTextDocument(uri);
}