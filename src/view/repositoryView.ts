import * as vscode from "vscode";
import type { CategoryDTO } from "../models/category/categoryDTO";
import type { PostDTO } from "../models/post/postDTO";
import { CategoryTreeItem } from "../models/category/categoryTreeItem";
import { PostTreeItem } from "../models/post/postTreeItem";
import { TreeViewBase } from "./viewBase";
import { CategoryRepository } from "../models/category/categoryRepository";
import type { RepositorySyncService } from "../services/repositorySyncService";
import { CategoryRepositorySyncService } from "../services/implements/categoryRepositorySyncService";

type DTO = PostDTO | CategoryDTO;

export class RepositoryView extends TreeViewBase<DTO> {
    constructor() {
        super(
            'jekyll-n-hyde.view.repository',
            new RepositoryTreeDataProvider()
        );
    }
}

class RepositoryTreeDataProvider implements vscode.TreeDataProvider<DTO> {
    private readonly repositorySyncService: RepositorySyncService<CategoryDTO, CategoryRepository>;
    private readonly onDidChangeTreeDataEventEmiiter: vscode.EventEmitter<void | DTO | DTO[] | null | undefined> = new vscode.EventEmitter();

    constructor() {
        this.repositorySyncService = new CategoryRepositorySyncService();
        this.repositorySyncService.onDidLoad(categoryRepository => {
            this.onDidChangeTreeDataEventEmiiter.fire(undefined);
        });
    }

    onDidChangeTreeData: vscode.Event<void | DTO | DTO[] | null | undefined> = this.onDidChangeTreeDataEventEmiiter.event;

    getTreeItem: (element: DTO) => Promise<vscode.TreeItem> = async (element: DTO) => {
        if (this.isCategoryDTO(element)) {
            return new CategoryTreeItem(element);
        }
        if (this.isPostDTO(element)) {
            return new PostTreeItem(element);
        }
        throw new Error("Unsupported type of DTO.");
    }

    getChildren: (element?: DTO | undefined) => Promise<DTO[]> = async (element?: DTO | undefined) => {
        await this.repositorySyncService.ensureLoaded();
        if (element === undefined) {
            const root = this.repositorySyncService.getRepository().findRoot();
            return await this.getChildren(root);
        }
        if (this.isCategoryDTO(element)) {
            return [
                ...element.categories,
                ...element.posts,
            ];
        }
        return [];
    };

    private isPostDTO(element: DTO): element is PostDTO {
        return 'uri' in element;
    }

    private isCategoryDTO(element: DTO): element is CategoryDTO {
        return 'names' in element;
    }
}