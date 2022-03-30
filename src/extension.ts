import * as vscode from 'vscode';
import "./commands";
import { CategorizedPosts } from './views/categorizedPosts';


export function activate(context: vscode.ExtensionContext) {
	if (!vscode.workspace.workspaceFolders) {
		vscode.window.showInformationMessage("Could not find workspace folder.");
		return;
	}
	new CategorizedPosts(context);
}
