import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";

function addNumberToBasenameIfExists(uri: vscode.Uri): vscode.Uri {
    let uniqueUri: vscode.Uri = uri;
    for (let i = 0; fs.existsSync(uniqueUri.fsPath); i++) {
        uniqueUri = addNumberToBasename(uri, i);
    }
    return uniqueUri;
}

function addNumberToBasename(uri: vscode.Uri, num: number): vscode.Uri {
    const dirname = path.dirname(uri.fsPath);
    const extname = path.extname(uri.fsPath);
    const basenameWithoutExtname = path.basename(uri.fsPath, extname);
    const basename = (num === 0)
        ? basenameWithoutExtname + extname
        : basenameWithoutExtname + ` (${num})` + extname;
    return vscode.Uri.file(path.join(dirname, basename));
}

export {
    addNumberToBasenameIfExists,
    addNumberToBasename,
}