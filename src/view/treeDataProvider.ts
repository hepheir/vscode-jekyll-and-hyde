import * as vscode from "vscode";
import type { CategoryDTO } from "../models/category/categoryDTO";
import type { PostDTO } from "../models/post/postDTO";
import { CategoryTreeItem } from "../models/category/categoryTreeItem";
import { PostTreeItem } from "../models/post/postTreeItem";
import { CategoryPostExplorerService } from "../services/categoryPostExplorerService";
import { TreeViewBase } from "./viewBase";

type DTO = PostDTO | CategoryDTO;

export class JekyllRepositoryView extends TreeViewBase<DTO> {
    constructor() {
        super(
            'jekyll-n-hyde.view.repository',
            new JekyllRepositoryTreeDataProvider()
        );
    }
}

class JekyllRepositoryTreeDataProvider implements vscode.TreeDataProvider<DTO> {
    private readonly explorerService = new CategoryPostExplorerService();
    private readonly _onDidChangeTreeData: vscode.EventEmitter<void | DTO | DTO[] | null | undefined> = new vscode.EventEmitter();

    constructor() {
        this.explorerService.onDidLoad(uris => this._onDidChangeTreeData.fire(undefined));
    }

    onDidChangeTreeData: vscode.Event<void | DTO | DTO[] | null | undefined> = this._onDidChangeTreeData.event;

    async getTreeItem(element: DTO): Promise<vscode.TreeItem> {
        if (this.isCategoryDTO(element)) {
            return new CategoryTreeItem(element);
        }
        if (this.isPostDTO(element)) {
            return new PostTreeItem(element);
        }
        throw new Error("Unsupported type of DTO.");
    }

    async getChildren(element?: DTO | undefined): Promise<DTO[]> {
        await this.explorerService.ensureLoaded();
        if (element === undefined) {
            const root = this.explorerService.getRoot()
            return root;
        }
        if (this.isCategoryDTO(element)) {
            return element.posts;
        }
        return [];
    }

    private isPostDTO(element: DTO): element is PostDTO {
        return 'uri' in element;
    }

    private isCategoryDTO(element: DTO): element is CategoryDTO {
        return 'name' in element;
    }
}