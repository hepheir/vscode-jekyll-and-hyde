import * as vscode from "vscode";
import type { CategoryDTO } from "./category/categoryDTO";
import type { PostDTO } from "./post/postDTO";
import { CategoryTreeItem } from "./category/categoryTreeItem";
import { PostTreeItem } from "./post/postTreeItem";
import { TreeDataService } from "./treeDataService";

type DTO = PostDTO | CategoryDTO;

export class TreeDataProvider implements vscode.TreeDataProvider<DTO> {
    private readonly treeDataService = new TreeDataService();
    private readonly _onDidChangeTreeData: vscode.EventEmitter<void | DTO | DTO[] | null | undefined> = new vscode.EventEmitter();

    constructor() {
        this.treeDataService.onDidLoad(uris => this._onDidChangeTreeData.fire(undefined));
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
        await this.treeDataService.ensureLoaded();
        if (element === undefined) {
            const root = this.treeDataService.getRoot()
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