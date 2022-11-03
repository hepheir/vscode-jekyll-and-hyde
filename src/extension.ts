import * as vscode from 'vscode';
import FileSystemPageRepository from './models/fileSystemPageRepository';
import PageRepository from './models/pageRepository';
import create from './views/explorer/commands/create';
import ExplorerTreeDataProvider from './views/explorer/treeDataProvider';


export function activate(context: vscode.ExtensionContext) {
	if (!vscode.workspace.workspaceFolders) {
		vscode.window.showInformationMessage("Could not find workspace folder.");
		return;
	}

	const pageRepository: PageRepository = new FileSystemPageRepository();
	const treeDataProvider = new ExplorerTreeDataProvider(pageRepository);
    const treeViewOptions: vscode.TreeViewOptions<unknown> = {
        canSelectMany: false,
        showCollapseAll: true,
        treeDataProvider,
    };

	pageRepository.load();

	vscode.window.createTreeView('explorer', treeViewOptions);
	vscode.commands.registerCommand('explorer.refresh', pageRepository.load);
	vscode.commands.registerCommand('explorer.item.create', create);
}
