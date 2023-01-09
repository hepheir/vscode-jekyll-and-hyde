import * as vscode from "vscode";
import type { CategoryDTO } from "../models/categoryDTO";
import type { PostDTO } from "../models/postDTO";
import { CategoryTreeItem } from "../models/categoryTreeItem";
import { PostTreeItem } from "../models/postTreeItem";
import { TreeViewBase } from "./viewBase";
import { CategoryRepository } from "../models/categoryRepository";
import { CategoryRepositorySyncService } from "../services/categoryRepositorySyncService";

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
    private readonly repositorySyncService: CategoryRepositorySyncService;
    private readonly onDidChangeTreeDataEventEmiiter: vscode.EventEmitter<void | DTO | DTO[] | null | undefined> = new vscode.EventEmitter();

    constructor() {
        while (true) {
            try {
                this.repositorySyncService = new CategoryRepositorySyncService();
                break;
            } catch (error) {
                vscode.window.showErrorMessage('Error while initializing RepositorySyncService');
            }
        }
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