import * as vscode from "vscode";
import Category from "../../models/category";
import CategoryTree from "../../models/categoryTree";
import Page from "../../models/page";
import PageLoader from "../../models/pageLoader";
import ExplorerTreeData from "./ExplorerTreeData";
import CategoryTreeItem from './treeItems/CategoryTreeItem';
import DraftTreeItem from "./treeItems/DraftTreeItem";
import PostTreeItem from "./treeItems/PostTreeItem";

export default class ExplorerTreeDataProvider implements vscode.TreeDataProvider<ExplorerTreeData> {
    private readonly _onDidChangeTreeData = new vscode.EventEmitter<ExplorerTreeData | null | undefined>();
    private readonly pageLoader: PageLoader;

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
}