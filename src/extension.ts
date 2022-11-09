import * as vscode from 'vscode';
import FileSystemPageLoader from './models/fileSystemPageLoader';
import TreeView from './views/explorer/TreeView';

export function activate(context: vscode.ExtensionContext) {
	if (!vscode.workspace.workspaceFolders) {
		vscode.window.showInformationMessage("Could not find workspace folder.");
		return;
	}

	const pageLoader = new FileSystemPageLoader();
	pageLoader.addSubscriber(new TreeView());
	pageLoader.load();
	vscode.commands.registerCommand('explorer.refresh', pageLoader.load);
}
