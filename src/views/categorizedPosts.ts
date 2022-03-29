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
                pages = pages.sort((p1, p2) => p1.title.localeCompare(p2.title));
                pages = pages.sort((p1, p2) => p1.date.getTime() - p2.date.getTime());
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
        vscode.commands.registerCommand('categorizedPosts.deleteResource', (e) => this.deleteResource(e));
        vscode.commands.registerCommand('categorizedPosts.postResource', (e) => this.postResource(e));
        vscode.commands.registerCommand('categorizedPosts.draftResource', (e) => this.draftResource(e));
        vscode.commands.registerCommand('categorizedPosts.addDraftResource', (e) => this.addDraftResource(e));
        vscode.commands.registerCommand('categorizedPosts.refresh', (e) => this.refresh());
        vscode.commands.registerCommand('categorizedPosts.updateLastModification', (e) => this.updateLastModification(e));
        vscode.workspace.onDidSaveTextDocument((e) => vscode.commands.executeCommand('categorizedPosts.refresh'));
    }

    private async updateLastModification(entry: Entry) {
        if (!entry.post) {
            return;
        }
        const resource = vscode.Uri.parse(entry.post.path);
        const buffer = await vscode.workspace.fs.readFile(resource);
        const file = matter(buffer.toString());
        file.data.last_modified_at = new Date(Date.now());
        const content = matter.stringify(file.content, file.data);
        await vscode.workspace.fs.writeFile(resource, Buffer.from(content));
        await vscode.window.showTextDocument(resource);
    }

    private async deleteResource(entry: Entry) {
        if (!entry.post) {
            return;
        }
        const resourceUri = vscode.Uri.parse(entry.post.path);
        await vscode.workspace.fs.delete(resourceUri);
        await this.refresh();
    }

    private async refresh() {
        this.treeDataProvider.refresh();
    }

    private async postResource(entry: Entry) {
        if (!entry.post) {
            return;
        }
        const resourceUri = vscode.Uri.parse(entry.post.path);
        const targetUri = PostNameParser.draftToPost(resourceUri);
        await vscode.workspace.fs.rename(resourceUri, targetUri, { overwrite: false });
        await vscode.window.showTextDocument(targetUri);
        await vscode.commands.executeCommand('categorizedPosts.refresh');
    }

    private async draftResource(entry: Entry) {
        if (!entry.post) {
            return;
        }
        const resourceUri = vscode.Uri.parse(entry.post.path);
        const targetUri = PostNameParser.postToDraft(resourceUri);
        await vscode.workspace.fs.rename(resourceUri, targetUri, { overwrite: false });
        await vscode.window.showTextDocument(targetUri);
        await vscode.commands.executeCommand('categorizedPosts.refresh');
    }

    private async addDraftResource(entry: Entry) {
        // TODO: 하단의 조건문 지옥을 완화시켜보기
        if (!entry.category) {
            return;
        }
        const entries = await this.treeDataProvider.getChildren(entry);
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
            category: entry.category == CategoriesParser.UNCATEGORIZED
                ? ''
                : entry.category,
            date: new Date(Date.now())
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
            await vscode.commands.executeCommand('categorizedPosts.refresh');
        } catch (error) {
            vscode.window.showErrorMessage('File already exists.');
            vscode.workspace.fs.delete(tempFileUri);
        }
    }
}
