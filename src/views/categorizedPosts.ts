import * as vscode from 'vscode';
import * as matter from 'gray-matter';
import { Page, Site } from 'jekyll';
import { SiteParser } from '../parsers/siteParser';
import { PostNameParser } from '../parsers/postNameParser';
import { CategoriesParser } from '../parsers/categoriesParser';


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
        const label: string = element.category ?? element.post?.title ?? '[Error] Could not resolve name';
        const treeItem = new vscode.TreeItem(label);
        if (element.category) {
            const nItems = this.site.categories[element.category].length;
            const nDrafts = this.site.categories[element.category].filter(p => p.dir.startsWith('_drafts')).length;
            treeItem.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
			treeItem.contextValue = 'category';
            treeItem.description = [
                `${nItems-nDrafts} items`,
                nDrafts
                    ? `(+${nDrafts} drafts)`
                    : '',
            ].join(' ');
            treeItem.iconPath = new vscode.ThemeIcon('archive');
            if (element.category == CategoriesParser.UNCATEGORIZED) {
                treeItem.iconPath = new vscode.ThemeIcon('x');
            }
        } else if (element.post && element.post.dir.startsWith('_posts')) {
            const uri = vscode.Uri.parse(element.post.path);
            treeItem.collapsibleState = vscode.TreeItemCollapsibleState.None;
			treeItem.command = { command: 'vscode.open', title: "Open File", arguments: [uri], };
			treeItem.contextValue = 'post';
            treeItem.description = element.post.name;
            treeItem.iconPath = new vscode.ThemeIcon('rocket');
            treeItem.resourceUri = uri;
        } else if (element.post && element.post.dir.startsWith('_drafts')) {
            const uri = vscode.Uri.parse(element.post.path);
            treeItem.collapsibleState = vscode.TreeItemCollapsibleState.None;
			treeItem.command = { command: 'vscode.open', title: "Open File", arguments: [uri], };
			treeItem.contextValue = 'draft';
            treeItem.description = element.post.name;
            treeItem.iconPath = new vscode.ThemeIcon('microscope');
            treeItem.resourceUri = uri;
        } else if (element.post) {
            const uri = vscode.Uri.parse(element.post.path);
            treeItem.collapsibleState = vscode.TreeItemCollapsibleState.None;
			treeItem.command = { command: 'vscode.open', title: "Open File", arguments: [uri], };
			treeItem.contextValue = 'page';
            treeItem.description = element.post.name;
            treeItem.iconPath = new vscode.ThemeIcon('file-text');
            treeItem.resourceUri = uri;
        }
		return treeItem;
	}

	async getChildren(element?: Entry): Promise<Entry[]> {
		if (element) {
            const category = element.category ?? '';
            var pages = this.site.categories[category];
            try {
                pages.sort((p1, p2) => p1.title.localeCompare(p2.title));
                pages.sort((p1, p2) => p1.date.localeCompare(p2.date));
            } catch (error) {
                vscode.window.showErrorMessage(`Unable to sort items of category "${category}"`);
            } finally {
                return pages.map(p => ({post: p,}));
            }
		}

        this.site = await SiteParser.parse();
        return Object.keys(this.site.categories)
            .sort((name1, name2) => name1.localeCompare(name2))
            .sort((name1, name2) => name2 == CategoriesParser.UNCATEGORIZED ? -1 : 0)
            .map(name => ({category: name}));
	}
}

export class CategorizedPosts {
    private readonly treeDataProvider: PostDataProvider = new PostDataProvider();

    constructor(context: vscode.ExtensionContext) {
        context.subscriptions.push(vscode.window.createTreeView('categorizedPosts', { treeDataProvider: this.treeDataProvider }));
        vscode.commands.registerCommand('categorizedPosts.deleteResource', (resource) => this.deleteResource(resource));
        vscode.commands.registerCommand('categorizedPosts.postResource', (resource) => this.postResource(resource));
        vscode.commands.registerCommand('categorizedPosts.draftResource', (resource) => this.draftResource(resource));
        vscode.commands.registerCommand('categorizedPosts.addDraftResource', (resource) => this.addDraftResource(resource));
        vscode.commands.registerCommand('categorizedPosts.refresh', () => this.refresh());
        vscode.workspace.onDidSaveTextDocument((e) => vscode.commands.executeCommand('categorizedPosts.refresh'));
    }

    private async deleteResource(resource: Entry) {
        if (!resource.post) {
            return;
        }
        const resourceUri = vscode.Uri.parse(resource.post.path);
        await vscode.workspace.fs.delete(resourceUri);
        await this.refresh();
    }

    private async refresh() {
        this.treeDataProvider.refresh();
    }

    private async postResource(resource: Entry) {
        if (!resource.post) {
            return;
        }
        const resourceUri = vscode.Uri.parse(resource.post.path);
        const targetUri = PostNameParser.draftToPost(resourceUri);
        await vscode.workspace.fs.rename(resourceUri, targetUri, { overwrite: false });
        await vscode.window.showTextDocument(targetUri);
        await this.refresh();
    }

    private async draftResource(resource: Entry) {
        if (!resource.post) {
            return;
        }
        const resourceUri = vscode.Uri.parse(resource.post.path);
        const targetUri = PostNameParser.postToDraft(resourceUri);
        await vscode.workspace.fs.rename(resourceUri, targetUri, { overwrite: false });
        await vscode.window.showTextDocument(targetUri);
        await this.refresh();
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
            category: resource.category == CategoriesParser.UNCATEGORIZED
                ? ''
                : resource.category,
        });
        await vscode.workspace.fs.writeFile(tempFileUri, Buffer.from(content));

        const fileNamePlaceHolder = PostNameParser.addDatePrefix('untitled.md');
        const fileName = await vscode.window.showInputBox({
                placeHolder: 'Enter the name of file',
                value: fileNamePlaceHolder,
        }) ?? fileNamePlaceHolder;

        const targetUri = vscode.Uri.joinPath(workspaceFolder.uri, '_drafts', fileName);
        try {
            await vscode.workspace.fs.rename(tempFileUri, targetUri, { overwrite: false });
            await vscode.window.showTextDocument(targetUri);
            await this.refresh();
        } catch (error) {
            vscode.window.showErrorMessage('File already exists.');
            vscode.workspace.fs.delete(tempFileUri);
        }
    }
}
