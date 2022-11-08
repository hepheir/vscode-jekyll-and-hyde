import * as vscode from "vscode";
import Category from "../../models/category";
import CategoryTree from "../../models/categoryTree";
import Page from "../../models/page";
import PageLoader from "../../models/pageLoader";
import moveCategory from "./commands/moveCategory";
import ExplorerTreeData from "./ExplorerTreeData";
import CategoryTreeItem from './treeItems/CategoryTreeItem';
import DraftTreeItem from "./treeItems/DraftTreeItem";
import PostTreeItem from "./treeItems/PostTreeItem";

export default class ExplorerTreeDataProvider implements vscode.TreeDataProvider<ExplorerTreeData>, vscode.TreeDragAndDropController<ExplorerTreeData> {
    private readonly _onDidChangeTreeData = new vscode.EventEmitter<ExplorerTreeData | null | undefined>();
    private readonly pageLoader: PageLoader;
    public readonly dropMimeTypes = ['application/vnd.code.jekyll-n-hyde.dragAndDrop'];
	public readonly dragMimeTypes = [];

    constructor(pageLoader: PageLoader) {
        this.onLoad = this.onLoad.bind(this);
        this.pageLoader = pageLoader;
        this.pageLoader.onDidLoad(this.onLoad);
    }

    private onLoad(posts: Page[]) {
        CategoryTree.instance.makeTree(posts);
        this._onDidChangeTreeData.fire(undefined);
    }

    onDidChangeTreeData = this._onDidChangeTreeData.event;

    getTreeItem(element: ExplorerTreeData): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return this._getTreeItem(element);
    }

    private _getTreeItem(element: ExplorerTreeData): PostTreeItem | DraftTreeItem | CategoryTreeItem {
        if (element instanceof Category) {
            return new CategoryTreeItem(element);
        }
        if (!element.published) {
            return new DraftTreeItem(element);
        }
        return new PostTreeItem(element);
    }

    getChildren(element?: ExplorerTreeData | undefined): vscode.ProviderResult<ExplorerTreeData[]> {
        return this._getChildren(element);
    }

    private _getChildren(element?: ExplorerTreeData): ExplorerTreeData[] {
        if (element === undefined) {
            element = CategoryTree.instance.getRoot();
        }
        if (element instanceof Category) {
            return element.children;
        }
        return [];
    }

    getParent(element: ExplorerTreeData): vscode.ProviderResult<ExplorerTreeData> {
        return this._getParent(element);
    }

    private _getParent(element: ExplorerTreeData) {
        if (element instanceof Category) {
            return element.parent;
        }
        return CategoryTree.instance.findCategoryByPost(element);
    }

    handleDrag?(source: readonly ExplorerTreeData[], dataTransfer: vscode.DataTransfer, token: vscode.CancellationToken): void | Thenable<void> {
        dataTransfer.set(this.dropMimeTypes[0], new vscode.DataTransferItem(source));
    }

    handleDrop?(targetData: ExplorerTreeData | undefined, dataTransfer: vscode.DataTransfer, token: vscode.CancellationToken): void | Thenable<void> {
        const source = this.parseSource(dataTransfer);
        const target = this.parseTarget(targetData);
        if (target === undefined || source === undefined) {
            return;
        }
        moveCategory(source, target).then(() => this.pageLoader.load());
    }

    private parseSource(dataTransfer: vscode.DataTransfer): Page | undefined {
        const dataTransferItem = dataTransfer.get(this.dropMimeTypes[0]);
        if (!dataTransferItem) {
            return undefined;
        }
        const source: ExplorerTreeData = dataTransferItem.value[0];
        if (source instanceof Category) {
            return undefined;
        }
        return source;
    }

    private parseTarget(target?: ExplorerTreeData): Category | undefined {
        if (target === undefined) {
            return undefined;
        }
        if (target instanceof Category) {
            return target;
        }
        return CategoryTree.instance.findCategoryByPost(target);
    }
}