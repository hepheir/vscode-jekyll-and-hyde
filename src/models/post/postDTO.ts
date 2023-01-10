import * as vscode from "vscode";
import type { Frontmatter } from "./frontmatter";
import type { Comparable } from "../../util/comparable";

export interface PostDTO extends Comparable<PostDTO> {
    uri: vscode.Uri;
    title: string;
    categories: string[];
    frontmatter: Frontmatter;
}