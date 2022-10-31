import * as vscode from "vscode";
import Page from "../../models/page";
import PageRepository from '../../models/pageRepository';
import CategoryTreeItem from './treeItems/CategoryTreeItem';
import DraftTreeItem from "./treeItems/DraftTreeItem";
import PageTreeItem from './treeItems/PageTreeItem';
import PostTreeItem from "./treeItems/PostTreeItem";

function isCategory(value: any): value is Category {
    return typeof value == "string";
}

type Category = string;
type TreeData = Page | Category;

export default class ExplorerTreeDataProvider implements vscode.TreeDataProvider<TreeData> {
    private readonly _onDidChangeTreeData = new vscode.EventEmitter<void | TreeData | null | undefined>();
    private readonly pageRepository: PageRepository;

    constructor(pageRepository: PageRepository) {
        this.refresh = this.refresh.bind(this);

        this.pageRepository = pageRepository;
        this.pageRepository.onDidLoad(this.refresh);
    }

    private refresh(...args: any[]) {
        this._onDidChangeTreeData.fire();
    }

    onDidChangeTreeData = this._onDidChangeTreeData.event;

    getTreeItem(element: TreeData): vscode.TreeItem | Thenable<vscode.TreeItem> {
        if (isCategory(element)) {
            return new CategoryTreeItem(element);
        }
        if (!element.published) {
            return new DraftTreeItem(element);
        }
        return new PostTreeItem(element);
    }

    getChildren(element?: TreeData | undefined): vscode.ProviderResult<TreeData[]> {
        if (element === undefined) {
            return [
                ...this.pageRepository.findAllCategories(),
                ...this.pageRepository.findAllPagesByCategory(null).sort(this.pageCompare),
            ];
        }
        if (isCategory(element)) {
            return this.pageRepository.findAllPagesByCategory(element).sort(this.pageCompare);
        }
        return [];
    }

    private pageCompare(prevPage: Page, nextPage: Page): number {
        return prevPage.title.localeCompare(nextPage.title);
    }
}