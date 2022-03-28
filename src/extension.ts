import * as vscode from 'vscode';
import { CategorizedPosts } from './views/categorizedPosts';


export function activate(context: vscode.ExtensionContext) {
	new CategorizedPosts(context);
}
