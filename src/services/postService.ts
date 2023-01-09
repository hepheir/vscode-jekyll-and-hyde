import * as vscode from "vscode";
import type { PostDTO } from "../models/post/postDTO";

/**
 * - *Note*: this service will affect neither `CategoryService` nor `CategoryRepository`.
 */
export interface PostService {
    create: (title: string, categories: readonly string[], uri?: vscode.Uri | undefined) => PostDTO;
}