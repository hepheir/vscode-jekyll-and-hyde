import * as vscode from 'vscode';
import { RepositoryView } from './view/repositoryView';

export function activate(context: vscode.ExtensionContext) {
	if (!vscode.workspace.workspaceFolders) {
		vscode.window.showInformationMessage("Could not find workspace folder.");
		return;
	}

	new RepositoryView();
}
