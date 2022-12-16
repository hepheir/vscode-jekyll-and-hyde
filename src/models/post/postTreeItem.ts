import * as path from "path";
import * as vscode from "vscode";
import type { PostDTO } from "./postDTO";

export class PostTreeItem extends vscode.TreeItem {
    constructor(
        public readonly post: PostDTO
    ) {
        super(post.title);
        this.collapsibleState = vscode.TreeItemCollapsibleState.None;
        this.iconPath = vscode.ThemeIcon.File;
        this.resourceUri = post.uri;
        this.description = path.basename(post.uri.path);
        this.command = {
            command: 'vscode.open',
            title: "Open File",
            arguments: [post.uri],
        };
    }
}