import * as vscode from "vscode";
import type { RepositoryItem } from "../repositoryItem";
import type { Frontmatter } from "./frontmatter";

export interface PostDTO extends RepositoryItem<PostDTO> {
    uri: vscode.Uri;
    title: string;
    categories: string[];
    frontmatter: Frontmatter;
}