import * as vscode from "vscode";
import type { Frontmatter } from "./frontmatter";

export interface PostDTO {
    uri: vscode.Uri;
    title: string;
    categories: string[];
    frontmatter: Frontmatter;
}