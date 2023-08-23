import * as vscode from 'vscode';
import { viewOptions } from './view';


export function activate(context: vscode.ExtensionContext) {
	vscode.window.createTreeView('jekyll-n-hyde.view', viewOptions);
}
