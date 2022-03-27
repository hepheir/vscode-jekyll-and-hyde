import * as vscode from 'vscode';
import { ReloadSiteCommand } from './commands/reloadSite';
import { ShowTextDocumentCommand } from './commands/showTextDocument';
import { UpdateViewsCommand } from './commands/updateViews';
import { registerCommands } from './commands/base';
import { CategoryView } from './views/categoryView';
import { PageView } from './views/pageView';
import { PostView } from './views/postView';
import { DraftView } from './views/draftView';
import { createViews } from './views/base';


export function activate(context: vscode.ExtensionContext) {
	const uses = [
		ReloadSiteCommand,
		ShowTextDocumentCommand,
		UpdateViewsCommand,
		CategoryView,
		DraftView,
		PageView,
		PostView,
	];
	const reload = () => vscode.commands.executeCommand('reloadSite');

	registerCommands(context);
	createViews(context);

	vscode.workspace.onDidSaveTextDocument(reload);
	reload();
}
