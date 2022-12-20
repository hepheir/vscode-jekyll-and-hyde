import * as vscode from "vscode";
import type { CategoryDTO } from "../models/category/categoryDTO";
import { PostDTO } from "../models/post/postDTO";

export interface CategoryService {
    create: (names: readonly string[]) => CategoryDTO;
    getRoot: () => CategoryDTO;
    findAll: () => CategoryDTO[];
    find: (names: readonly string[]) => CategoryDTO | undefined;
    move: (sourceNames: readonly string[], targetNames: readonly string[]) => void;
    rename: (oldNames: readonly string[], newNames: readonly string[]) => CategoryDTO;
    createPost: (uri: vscode.Uri, title: string, categories: readonly string[]) => PostDTO;
    addPost: (uri: vscode.Uri) => void;
    delete: (names: readonly string[]) => void;
}