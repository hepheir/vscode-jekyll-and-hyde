import * as vscode from 'vscode';
import * as matter from 'gray-matter';
import { Page, Site } from 'jekyll';
import { SiteParser } from '../parsers/siteParser';


export interface Entry {
    category?: string
    post?: Page;
}

export class PostDataProvider implements vscode.TreeDataProvider<Entry> {
	private _onDidChangeTreeData: vscode.EventEmitter<Entry | undefined | void> = new vscode.EventEmitter<Entry | undefined | void>();
	readonly onDidChangeTreeData: vscode.Event<Entry | undefined | void> = this._onDidChangeTreeData.event;

    private site: Site = {
        time: new Date(Date.now()),
        categories: {},
        posts: [],
        pages: [],
    };

	refresh(): void {
		this._onDidChangeTreeData.fire();
	}

    getTreeItem(element: Entry): vscode.TreeItem {
        const label: string = element.category ?? element.post?.title ?? 'untitled';
        const treeItem = new vscode.TreeItem(label);
        if (element.category) {
            const nPosts = this.site.categories[element.category].filter(p => p.dir.startsWith('_posts')).length;
            const nDrafts = this.site.categories[element.category].filter(p => p.dir.startsWith('_drafts')).length;
            treeItem.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
			treeItem.contextValue = 'category';
            treeItem.description = `${nPosts} posts, ${nDrafts} drafts`;
            treeItem.iconPath = new vscode.ThemeIcon('archive');
        } else if (element.post && element.post.dir.startsWith('_posts')) {
            const uri = vscode.Uri.parse(element.post.path);
            treeItem.collapsibleState = vscode.TreeItemCollapsibleState.None;
			treeItem.command = { command: 'categorizedPosts.openResource', title: "Open File", arguments: [uri], };
			treeItem.contextValue = 'post';
            treeItem.description = element.post.name;
            treeItem.iconPath = new vscode.ThemeIcon('file-text');
            treeItem.resourceUri = uri;
        } else if (element.post && element.post.dir.startsWith('_drafts')) {
            const uri = vscode.Uri.parse(element.post.path);
            treeItem.collapsibleState = vscode.TreeItemCollapsibleState.None;
			treeItem.command = { command: 'categorizedPosts.openResource', title: "Open File", arguments: [uri], };
			treeItem.contextValue = 'draft';
            treeItem.description = element.post.name;
            treeItem.iconPath = new vscode.ThemeIcon('beaker');
            treeItem.resourceUri = uri;
        }
		return treeItem;
	}

	async getChildren(element?: Entry): Promise<Entry[]> {
		if (element) {
            const category = element.category ?? '';
            return this.site.categories[category]
                .map(p => ({post: p,}));
		}

        this.site = await SiteParser.parse();
        return Object.keys(this.site.categories)
            .sort((name1, name2) => name1.localeCompare(name2))
            .map(name => ({category: name}));
	}
}

export class CategorizedPosts {
    private readonly treeDataProvider: PostDataProvider = new PostDataProvider();

    constructor(context: vscode.ExtensionContext) {
        context.subscriptions.push(vscode.window.createTreeView('categorizedPosts', { treeDataProvider: this.treeDataProvider }));
        vscode.commands.registerCommand('categorizedPosts.openResource', (resource) => this.openResource(resource));
        vscode.commands.registerCommand('categorizedPosts.deleteResource', (resource) => this.deleteResource(resource));
        vscode.commands.registerCommand('categorizedPosts.postResource', (resource) => this.postResource(resource));
        vscode.commands.registerCommand('categorizedPosts.draftResource', (resource) => this.draftResource(resource));
        vscode.commands.registerCommand('categorizedPosts.addDraftResource', (resource) => this.addDraftResource(resource));
        vscode.commands.registerCommand('categorizedPosts.refresh', () => this.refresh());
        vscode.workspace.onDidSaveTextDocument((e) => vscode.commands.executeCommand('categorizedPosts.refresh'));
    }

    private openResource(resource: vscode.Uri) {
        vscode.window.showTextDocument(resource);
    }

    private deleteResource(resource: Entry) {
        if (!resource.post) {
            return;
        }
        const resourceUri = vscode.Uri.parse(resource.post.path);
        vscode.workspace.fs.delete(resourceUri);
    }

    private refresh() {
        this.treeDataProvider.refresh();
    }

    private async postResource(resource: Entry) {
        if (!resource.post) {
            return;
        }
        const resourceUri = vscode.Uri.parse(resource.post.path);
        const targetUri = vscode.Uri.parse(resourceUri.fsPath.replace('_drafts', '_posts'));
        await vscode.workspace.fs.rename(resourceUri, targetUri, { overwrite: false });
        vscode.window.showTextDocument(targetUri);
        this.refresh();
    }

    private async draftResource(resource: Entry) {
        if (!resource.post) {
            return;
        }
        const resourceUri = vscode.Uri.parse(resource.post.path);
        const targetUri = vscode.Uri.parse(resourceUri.fsPath.replace('_posts', '_drafts'));
        await vscode.workspace.fs.rename(resourceUri, targetUri, { overwrite: false });
        vscode.window.showTextDocument(targetUri);
        this.refresh();
    }

    private async addDraftResource(resource: Entry) {
        // TODO: 하단의 조건문 지옥을 완화시켜보기
        if (!resource.category) {
            return;
        }
        const entries = await this.treeDataProvider.getChildren(resource);
        if (entries.length === 0) {
            return;
        }
        const firstEntry = entries[0];
        if (!firstEntry.post) {
            return;
        }
        const workspaceFolder = vscode.workspace.getWorkspaceFolder(vscode.Uri.parse(firstEntry.post.path));
        if (!workspaceFolder) {
            return;
        }
        // TODO: overwrite 피하기
        const tempFileUri = vscode.Uri.joinPath(workspaceFolder.uri, '.jekyll-n-hyde', 'tmp.md');
        const content = matter.stringify('', {
            title: ``,
            categories: [resource.category],
        });
        await vscode.workspace.fs.writeFile(tempFileUri, Buffer.from(content));

        const filename = await vscode.window.showInputBox({
                placeHolder: 'Enter the name of file',
                value: 'untitled.md',
        }) ?? 'untitled.md';
        const targetUri = vscode.Uri.joinPath(workspaceFolder.uri, '_drafts', filename);
        try {
            vscode.workspace.fs.rename(tempFileUri, targetUri, { overwrite: false });
            this.openResource(targetUri);
            this.refresh();
        } catch (error) {
            vscode.window.showErrorMessage('File already exists.');
            vscode.workspace.fs.delete(tempFileUri);
        }
    }
}
