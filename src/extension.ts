import * as vscode from 'vscode';
import { JekyllExplorer } from './jekyllExplorer';


export function activate(context: vscode.ExtensionContext) {
	new JekyllExplorer(context);
}
