import * as vscode from 'vscode';
import { RepositoryView } from './view/repositoryView';
import { PostCommand } from './command/post';

export function activate(context: vscode.ExtensionContext) {
	if (!vscode.workspace.workspaceFolders) {
		vscode.window.showInformationMessage("Could not find workspace folder.");
		return;
	}

	new RepositoryView();
	new PostCommand();
}
