import * as vscode from 'vscode';
import { JekyllSite } from './jekyllSite';
import { CachedNodes } from './views/nodes/cachedNodes';
import { CategoryView } from './views/categoryView';
import { DraftView } from './views/draftView';
import { PageView } from './views/pageView';
import { PostView } from './views/postView';


export function activate(context: vscode.ExtensionContext) {
	const source = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0
		? vscode.workspace.workspaceFolders[0].uri.fsPath
		: undefined;

	if (!source) {
		return;
	}

	CachedNodes.cache(context, new JekyllSite(source));

	new CategoryView(context, 'categoryView');
	new DraftView(context, 'draftView');
	new PageView(context, 'pageView');
	new PostView(context, 'postView');

	vscode.commands.registerCommand('showTextDocument', showTextDocument);
}

async function showTextDocument(resource: vscode.Uri) {
	vscode.window.showTextDocument(resource);
}
