import * as vscode from "vscode";
import Category from "../../models/category";
import Page from "../../models/page";
import PageLoader, { PageLoaderSubscriber } from "../../models/pageLoader";
import moveCategory from "./commands/moveCategory";
import CategoryTreeItem from './treeItems/CategoryTreeItem';
import DraftTreeItem from "./treeItems/DraftTreeItem";
import PostTreeItem from "./treeItems/PostTreeItem";

export default class TreeDataProvider implements vscode.TreeDataProvider<Page | Category>, vscode.TreeDragAndDropController<Page | Category>, PageLoaderSubscriber {
    public static readonly instance = new TreeDataProvider();

    public readonly dropMimeTypes = ['application/vnd.code.jekyll-n-hyde.dragAndDrop'];
    public readonly dragMimeTypes = [];
    private readonly _onDidChangeTreeData = new vscode.EventEmitter<Page | Category | null | undefined>();
    private root: Category = new Category('.');

    private constructor() {
        this.onLoad = this.onLoad.bind(this);
    }

    private onLoad(posts: Page[]) {
        this.makeCategoryTree(posts);
        this._onDidChangeTreeData.fire(undefined);
    }

    private makeCategoryTree(posts: Page[]) {
        this.root = new Category('.');
        posts.forEach(post => this.findCategoryByPost(post).addPost(post));
    }

    private findCategoryByPost(post: Page): Category {
        let category: Category = this.root;
        for (const label of post.categories) {
            category = category.findCategoryByLabel(label) ?? category.createSubcategory(label);
        }
        return category;
    }

    findPostByUri(uri: vscode.Uri): Page | undefined {
        return this.root.findPostByUri(uri);
    }

    changeTreeData(element?: Page | Category) {
        this._onDidChangeTreeData.fire(element);
    }

    onDidChangeTreeData = this._onDidChangeTreeData.event;

    getTreeItem(element: Page | Category): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return this._getTreeItem(element);
    }

    private _getTreeItem(element: Page | Category): PostTreeItem | DraftTreeItem | CategoryTreeItem {
        if (element instanceof Category) {
            return new CategoryTreeItem(element);
        }
        if (!element.published) {
            return new DraftTreeItem(element);
        }
        return new PostTreeItem(element);
    }

    getChildren(element?: Page | Category | undefined): vscode.ProviderResult<(Page | Category)[]> {
        return this._getChildren(element);
    }

    private _getChildren(element?: Page | Category): (Page | Category)[] {
        if (element === undefined) {
            element = this.root;
        }
        if (element instanceof Category) {
            return element.children;
        }
        return [];
    }

    getParent(element: Page | Category): vscode.ProviderResult<Page | Category> {
        return this._getParent(element);
    }

    private _getParent(element: Page | Category) {
        if (element instanceof Category) {
            return element.parent;
        }
        return this.findCategoryByPost(element);
    }

    handleDrag?(source: readonly (Page | Category)[], dataTransfer: vscode.DataTransfer, token: vscode.CancellationToken): void | Thenable<void> {
        dataTransfer.set(this.dropMimeTypes[0], new vscode.DataTransferItem(source));
    }

    handleDrop?(targetData: Page | Category | undefined, dataTransfer: vscode.DataTransfer, token: vscode.CancellationToken): void | Thenable<void> {
        this._handleDrop(targetData, dataTransfer);
    }

    private _handleDrop(targetData: Page | Category | undefined, dataTransfer: vscode.DataTransfer) {
        const source: Page | Category | undefined = dataTransfer.get(this.dropMimeTypes[0])?.value[0];
        const target: Category | undefined = this.getCategoryFromElement(targetData);
        if (target === undefined || source instanceof Category || source === undefined) {
            return;
        }
        moveCategory(source, target);
    }

    private getCategoryFromElement(element?: Page | Category): Category | undefined {
        if (element === undefined) {
            return undefined;
        }
        if (element instanceof Category) {
            return element;
        }
        return this.findCategoryByPost(element);
    }

    usePageLoader(pageLoader: PageLoader) {
        pageLoader.onDidLoad(this.onLoad);
    }
}