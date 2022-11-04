import * as vscode from 'vscode';
import FileSystemPageLoader from './models/fileSystemPageLoader';
import PageLoader from './models/pageLoader';
import create from './views/explorer/commands/create';
import ExplorerTreeDataProvider from './views/explorer/ExplorerTreeDataProvider';
import ExplorerTreeData from './views/explorer/ExplorerTreeData';
import CategoryTree from './models/categoryTree';

export function activate(context: vscode.ExtensionContext) {
	if (!vscode.workspace.workspaceFolders) {
		vscode.window.showInformationMessage("Could not find workspace folder.");
		return;
	}

	const pageLoader: PageLoader = new FileSystemPageLoader();

	const treeDataProvider = new ExplorerTreeDataProvider(pageLoader);
    const treeViewOptions: vscode.TreeViewOptions<ExplorerTreeData> = {
        canSelectMany: false,
        showCollapseAll: true,
        treeDataProvider: treeDataProvider,
		dragAndDropController: treeDataProvider,
    };
	const treeView = vscode.window.createTreeView('explorer', treeViewOptions);

	function focusOnPost(uri: vscode.Uri) {
		const post = CategoryTree.instance.getRoot().findPostByUri(uri);
		if (post) {
			treeView.reveal(post);
		}
	}

	vscode.commands.registerCommand('explorer.refresh', pageLoader.load);
	vscode.commands.registerCommand('explorer.item.create', create);

	vscode.workspace.onDidOpenTextDocument(e => focusOnPost(e.uri));
	vscode.workspace.onDidChangeTextDocument(e => focusOnPost(e.document.uri));

	pageLoader.load();
}
