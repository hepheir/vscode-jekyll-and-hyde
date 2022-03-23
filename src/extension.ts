import * as vscode from 'vscode';


export function activate(context: vscode.ExtensionContext) {
	vscode.commands.registerCommand('showTextDocument', showTextDocument);
}

async function showTextDocument(resource: vscode.Uri) {
	vscode.window.showTextDocument(resource);
}
