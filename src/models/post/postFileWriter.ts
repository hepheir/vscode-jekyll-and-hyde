import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import * as matter from "gray-matter";
import type { Frontmatter } from "./frontmatter";
import { TextEncoder } from "util";
import type { PostDTO } from "./postDTO";
import type { Writer } from "../common/writer";

export class PostFileWriter implements Writer<PostDTO> {
    constructor(
        private readonly post: PostDTO,
        private readonly overwrite: boolean = false,
    ) { }

    write(): void {
        let content = '';
        if (fs.existsSync(this.post.uri.fsPath)) {
            if (this.overwrite == false) {
                throw vscode.FileSystemError.FileExists(this.post.uri);
            }
            content = matter(this.post.uri.fsPath).content;
        }
        this.autoFillFrontmatter();
        this.writeOntoFile(this.post.frontmatter, content);
    }

    private autoFillFrontmatter() {
        this.post.frontmatter.title = this.post.title
            ?? this.post.frontmatter.title
            ?? path.basename(this.post.uri.path);
        this.post.frontmatter.categories = this.post.categories
            ?? this.post.frontmatter.categories
            ?? [];
    }

    private writeOntoFile(frontmatter: Frontmatter, content: string): void {
        const innerFile = new TextEncoder().encode(matter.stringify(content, frontmatter));
        fs.writeFileSync(this.post.uri.fsPath, innerFile);
    }
}