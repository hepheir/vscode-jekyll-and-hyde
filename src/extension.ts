import * as vscode from 'vscode';
import * as constants from './constants';
import { viewOptions } from './view';


export function activate(context: vscode.ExtensionContext) {
	vscode.window.createTreeView(constants.TREEVIEW_ID, viewOptions);
}
