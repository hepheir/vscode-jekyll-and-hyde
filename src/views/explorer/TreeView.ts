import * as vscode from "vscode";
import Page from "../../models/page";
import PageLoader, { PageLoaderSubscriber } from "../../models/pageLoader";
import createCategory from "./commands/createCategory";
import deletePage from "./commands/deletePage";
import TreeData from "./TreeData";
import TreeDataProvider from "./TreeDataProvider";

export default class TreeView implements PageLoaderSubscriber {
    public static readonly instance = new TreeView();

    public readonly view: vscode.TreeView<TreeData>;
    public readonly options: vscode.TreeViewOptions<TreeData>;
    public readonly treeDataProvider = TreeDataProvider.instance;

    private constructor() {
        this.options = {
            canSelectMany: false,
            showCollapseAll: true,
            treeDataProvider: this.treeDataProvider,
            dragAndDropController: this.treeDataProvider,
        };
        this.view = vscode.window.createTreeView('explorer', this.options);
        vscode.commands.registerCommand('explorer.createCategory', createCategory);
        vscode.commands.registerCommand('explorer.deletePage', deletePage);
        vscode.workspace.onDidOpenTextDocument(e => this.revealPostByUri(e.uri));
        vscode.workspace.onDidChangeTextDocument(e => this.revealPostByUri(e.document.uri));
    }

    private revealPostByUri(uri: vscode.Uri) {
		const post = this.findPostByUri(uri);
		if (post) {
			this.view.reveal(post);
		}
    }

    private findPostByUri(uri: vscode.Uri): Page | undefined {
        uri = this.schemeCvtGit2File(uri);
		return TreeDataProvider.instance.findPostByUri(uri);
    }

    private schemeCvtGit2File(gitUri: vscode.Uri): vscode.Uri {
        if (gitUri.scheme != 'git') {
            return gitUri;
        }
        return vscode.Uri.file(gitUri.path.replace(/\.git$/, ''));
    }

    usePageLoader(pageLoader: PageLoader): void {
        pageLoader.addSubscriber(TreeDataProvider.instance);
    }
}