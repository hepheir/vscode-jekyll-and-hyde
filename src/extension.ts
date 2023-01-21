import * as vscode from 'vscode';
import * as command from './command';
import { CategoriesView } from './view/categories';

export function activate(context: vscode.ExtensionContext) {
	if (!vscode.workspace.workspaceFolders) {
		vscode.window.showInformationMessage("Could not find workspace folder.");
		return;
	}

	// views
	CategoriesView.use();

	// commands
	command.use();
}
