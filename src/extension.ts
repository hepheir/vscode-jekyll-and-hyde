import * as vscode from 'vscode';
import * as commands from "./commands";
import { Commands } from './constants';
import * as views from "./views";


export function activate(context: vscode.ExtensionContext) {
	commands.registerCommands(context);
	views.createViews(context);

	const reload = () => vscode.commands.executeCommand(Commands.ReloadSite);

	vscode.workspace.onDidSaveTextDocument(reload);
	reload();
}
