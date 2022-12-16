import * as vscode from 'vscode';
import { JekyllRepositoryView } from './view/treeDataProvider';

export function activate(context: vscode.ExtensionContext) {
	if (!vscode.workspace.workspaceFolders) {
		vscode.window.showInformationMessage("Could not find workspace folder.");
		return;
	}

	new JekyllRepositoryView();
}
