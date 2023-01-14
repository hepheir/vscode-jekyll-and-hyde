import * as vscode from 'vscode';
import CategoriesView from './view/categories';
import CategoryCommands from './command/category';
import PostCommands from './command/post';

export function activate(context: vscode.ExtensionContext) {
	if (!vscode.workspace.workspaceFolders) {
		vscode.window.showInformationMessage("Could not find workspace folder.");
		return;
	}

	// views
	console.log("initializing views");
	CategoriesView.use();

	// commands
	console.log("initializing commands");
	PostCommands.use();
	CategoryCommands.use();
}
