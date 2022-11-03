import * as vscode from "vscode";
import Page from "../../models/page";
import PageRepository from '../../models/pageRepository';
import { ExplorerTreeData, isCategory } from "./treeData";
import CategoryTreeItem from './treeItems/CategoryTreeItem';
import DraftTreeItem from "./treeItems/DraftTreeItem";
import PostTreeItem from "./treeItems/PostTreeItem";

export default class ExplorerTreeDataProvider implements vscode.TreeDataProvider<ExplorerTreeData> {
    private readonly _onDidChangeTreeData = new vscode.EventEmitter<ExplorerTreeData | null | undefined>();
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

    getTreeItem(element: ExplorerTreeData): vscode.TreeItem | Thenable<vscode.TreeItem> {
        if (isCategory(element)) {
            return new CategoryTreeItem(element);
        }
        if (!element.published) {
            return new DraftTreeItem(element);
        }
        return new PostTreeItem(element);
    }

    getChildren(element?: ExplorerTreeData | undefined): vscode.ProviderResult<ExplorerTreeData[]> {
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