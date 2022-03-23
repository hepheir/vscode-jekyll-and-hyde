import * as vscode from 'vscode';
import { JekyllExplorer } from './jekyllExplorer';


export function activate(context: vscode.ExtensionContext) {
	new JekyllExplorer(context);

	vscode.commands.registerCommand('showTextDocument', showTextDocument);
}

async function showTextDocument(resource: vscode.Uri) {
	vscode.window.showTextDocument(resource);
}
