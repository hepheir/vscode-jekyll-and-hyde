import * as vscode from 'vscode';
import FileSystemPageRepository from './models/fileSystemPageRepository';
import PageRepository from './models/pageRepository';
import ExplorerTreeDataProvider from './views/explorer/treeDataProvider';


export function activate(context: vscode.ExtensionContext) {
	if (!vscode.workspace.workspaceFolders) {
		vscode.window.showInformationMessage("Could not find workspace folder.");
		return;
	}

	const pageRepository: PageRepository = new FileSystemPageRepository();

	const treeViewId = 'categorizedPosts';
	const treeDataProvider = new ExplorerTreeDataProvider(pageRepository);
    const treeViewOptions: vscode.TreeViewOptions<unknown> = {
        canSelectMany: false,
        showCollapseAll: true,
        treeDataProvider,
    };
	vscode.window.createTreeView(treeViewId, treeViewOptions);

	const refreshCommandId = 'categorizedPosts.refresh';
	vscode.commands.registerCommand(refreshCommandId, pageRepository.load);

	pageRepository.load();

}
