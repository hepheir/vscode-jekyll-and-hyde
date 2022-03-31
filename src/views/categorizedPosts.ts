import * as vscode from 'vscode';
import { Page, Site } from 'jekyll';
import { SiteParser } from '../parsers/siteParser';
import { CategoriesParser } from '../parsers/categoriesParser';
import { PageParser } from '../parsers/pageParser';


export interface Entry {
    category?: string
    post?: Page;
}

export class PostDataProvider implements vscode.TreeDataProvider<Entry> {
    private site: Site = SiteParser.new();
	private _onDidChangeTreeData: vscode.EventEmitter<Entry | undefined | void> = new vscode.EventEmitter<Entry | undefined | void>();
	public readonly onDidChangeTreeData: vscode.Event<Entry | undefined | void> = this._onDidChangeTreeData.event;

	refresh(): void {
		this._onDidChangeTreeData.fire();
	}

    getTreeItem(element: Entry): vscode.TreeItem {
        const { category, post } = element;
        if (category) {
            return this.createCategoryItem(category);
        }
        const page = post!;
        const uri = vscode.Uri.file(page!.path);
        if (PageParser.isDraft(uri)) {
            return this.createDraftItem(page);
        } else if (PageParser.isPost(uri)) {
            return this.createPostItem(page);
        } else {
            return this.createPageItem(page);
        }
	}

	async getChildren(element?: Entry): Promise<Entry[]> {
        const category = element?.category;
        if (!category) {
            return await this.createCategoryEntries();
        }
        return this.createPageEntries(category);
	}

    private createPageItem(page: Page): vscode.TreeItem {
        const uri = vscode.Uri.parse(page.path);
        const command = { command: 'vscode.open', title: "Open File", arguments: [uri], };
        const item: vscode.TreeItem = {
            collapsibleState: vscode.TreeItemCollapsibleState.None,
            command: command,
            contextValue: 'page',
            description: page.name,
            iconPath: new vscode.ThemeIcon('file-text'),
            id: undefined,
            label: page.title,
            resourceUri: uri,
            tooltip: undefined,
        };
        return item;
    }

    private createDraftItem(draft: Page): vscode.TreeItem {
        const item: vscode.TreeItem = this.createPageItem(draft);
        item.contextValue = 'draft';
        item.iconPath = new vscode.ThemeIcon('microscope');
        return item;
    }

    private createPostItem(post: Page): vscode.TreeItem {
        const item: vscode.TreeItem = this.createPageItem(post);
        item.contextValue = 'post';
        item.iconPath = new vscode.ThemeIcon('rocket');
        return item;
    }

    private createCategoryItem(category: string): vscode.TreeItem {
        const description = this.getCategoryDetails(category);
        const iconPath = category == CategoriesParser.UNCATEGORIZED
            ? new vscode.ThemeIcon('x')
            : new vscode.ThemeIcon('archive');
        const item: vscode.TreeItem = {
            collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
            contextValue: 'category',
            description: description,
            iconPath: iconPath,
            id: category,
            label: category,
            resourceUri: undefined,
            tooltip: undefined,
        };
        return item;
    }

    private getCategoryDetails(category: string): string {
        const results: string[] = [];
        const nItems = this.site.categories[category].length;
        const nDrafts = this.site.categories[category]
            .map(page => vscode.Uri.file(page.path))
            .filter(uri => PageParser.isDraft(uri))
            .length;
        const nPosts = nItems-nDrafts;
        if (nPosts)
            results.push(`${nPosts} posts`);
        if (nDrafts)
            results.push(`(+${nDrafts} drafts)`);
        return results.join(' ');
    }

    private async createCategoryEntries(): Promise<Entry[]> {
        this.site = await SiteParser.parse();
        const categories = Object.keys(this.site.categories);
        categories.sort((name1, name2) => name1.localeCompare(name2));
        categories.sort((name1, name2) => name2 == CategoriesParser.UNCATEGORIZED ? -1 : 0);
        return categories.map(name => ({category: name,}));
    }

    private createPageEntries(category: string): Entry[] {
        const pages = this.site.categories[category];
        try {
            pages.sort((p1, p2) => p1.title.localeCompare(p2.title));
        } catch (error) {
            vscode.window.showErrorMessage(`Unable to sort items of category "${category}"`);
        } finally {
            return pages.map(p => ({post: p,}));
        }
    }
}

export class CategorizedPosts {
    public static readonly id = 'categorizedPosts';
    public static readonly treeDataProvider = new PostDataProvider();
    public static readonly view = vscode.window.createTreeView(this.id, { treeDataProvider: this.treeDataProvider });
    public static readonly refresh = () => CategorizedPosts.treeDataProvider.refresh();

    constructor(context: vscode.ExtensionContext) {
        context.subscriptions.push(CategorizedPosts.view);
        vscode.workspace.onDidCreateFiles(CategorizedPosts.refresh);
        vscode.workspace.onDidDeleteFiles(CategorizedPosts.refresh);
        vscode.workspace.onDidRenameFiles(CategorizedPosts.refresh);
        vscode.workspace.onDidSaveTextDocument(CategorizedPosts.refresh);
    }
}
