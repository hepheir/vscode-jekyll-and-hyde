import * as vscode from 'vscode';
import { Page, Site } from 'jekyll';
import { SiteParser } from '../parsers/siteParser';
import { CategoriesParser } from '../parsers/categoriesParser';


export interface Entry {
    category?: string
    post?: Page;
}

export class PostDataProvider implements vscode.TreeDataProvider<Entry> {
	private _onDidChangeTreeData: vscode.EventEmitter<Entry | undefined | void> = new vscode.EventEmitter<Entry | undefined | void>();
	readonly onDidChangeTreeData: vscode.Event<Entry | undefined | void> = this._onDidChangeTreeData.event;

    private site: Site = SiteParser.new();

	refresh(): void {
		this._onDidChangeTreeData.fire();
	}

    getTreeItem(element: Entry): vscode.TreeItem {
        const label: string = element.category ?? element.post?.title ?? '[Error] Could not resolve name';
        const treeItem = new vscode.TreeItem(label);
        if (element.category) {
            const nItems = this.site.categories[element.category].length;
            const nDrafts = this.site.categories[element.category].filter(p => p.dir.startsWith('_drafts')).length;
            const nPosts = nItems-nDrafts;
            treeItem.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
			treeItem.contextValue = 'category';
            treeItem.description = [
                `${nPosts} posts`,
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
    public static readonly treeDataProvider = new PostDataProvider();
    public static readonly refresh = () => CategorizedPosts.treeDataProvider.refresh();
    public static readonly view = vscode.window.createTreeView(
        'categorizedPosts',
        { treeDataProvider: CategorizedPosts.treeDataProvider }
    );

    constructor(context: vscode.ExtensionContext) {
        context.subscriptions.push(CategorizedPosts.view);
        vscode.workspace.onDidCreateFiles(CategorizedPosts.refresh);
        vscode.workspace.onDidDeleteFiles(CategorizedPosts.refresh);
        vscode.workspace.onDidRenameFiles(CategorizedPosts.refresh);
        vscode.workspace.onDidSaveTextDocument(CategorizedPosts.refresh);
    }
}
