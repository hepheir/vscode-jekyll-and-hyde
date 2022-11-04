import * as vscode from 'vscode';
import PageLoader from './models/pageLoader';
import create from './views/explorer/commands/create';
import ExplorerTreeDataProvider from './views/explorer/treeDataProvider';

export function activate(context: vscode.ExtensionContext) {
	if (!vscode.workspace.workspaceFolders) {
		vscode.window.showInformationMessage("Could not find workspace folder.");
		return;
	}

	const pageLoader: PageLoader = null; // TODO

	const treeDataProvider = new ExplorerTreeDataProvider(pageLoader);
    const treeViewOptions: vscode.TreeViewOptions<unknown> = {
        canSelectMany: false,
        showCollapseAll: true,
        treeDataProvider,
    };

	vscode.window.createTreeView('explorer', treeViewOptions);
	vscode.commands.registerCommand('explorer.refresh', pageLoader.load);
	vscode.commands.registerCommand('explorer.item.create', create);

	pageLoader.load();
}
