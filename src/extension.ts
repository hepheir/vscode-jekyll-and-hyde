import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

	let disposable = vscode.commands.registerCommand('jekyll-enthusiasm.helloWorld', () => {
		vscode.window.showInformationMessage('Hello World from jekyll-enthusiasm!');
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}
