import * as vscode from "vscode";
import type { PostDTO } from "../models/post/postDTO";

/**
 * - *Note*: this service will affect neither `CategoryService` nor `CategoryRepository`.
 */
export interface PostService {
    create: (uri: vscode.Uri, title: string, categories: readonly string[]) => PostDTO;
    add: (uri: vscode.Uri) => void;
    findAll: () => PostDTO[];
    findByUri: (uri: vscode.Uri) => PostDTO | undefined;
    findAllByCategories: (categories: readonly string[]) => PostDTO[];
    setTitle: (uri: vscode.Uri, title: string) => void;
    setCategories: (uri: vscode.Uri, categories: readonly string[]) => void;
    addCategories: (uri: vscode.Uri, category: string) => void;
    replaceCategories: (uri: vscode.Uri, oldCategory: string, newCategory: string) => void;
    removeCategories: (uri: vscode.Uri, category: string) => void;
    delete: (uri: vscode.Uri) => void;
}