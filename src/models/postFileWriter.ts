import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import * as matter from "gray-matter";
import { TextEncoder } from "util";
import type { PostDTO } from "./postDTO";
import type { Writer } from "../util/writer";

export class PostFileWriter implements Writer<PostDTO> {
    write(postDTO: PostDTO, overwrite: boolean = false): void {
        let content = '';
        if (fs.existsSync(postDTO.uri.fsPath)) {
            if (overwrite == false) {
                throw vscode.FileSystemError.FileExists(postDTO.uri);
            }
            content = matter(postDTO.uri.fsPath).content;
        }
        this.autoFillFrontmatter(postDTO);
        this.writeOntoFile(postDTO, content);
    }

    private autoFillFrontmatter(postDTO: PostDTO) {
        postDTO.frontmatter.title = postDTO.title
            ?? postDTO.frontmatter.title
            ?? path.basename(postDTO.uri.path);
        postDTO.frontmatter.categories = postDTO.categories
            ?? postDTO.frontmatter.categories
            ?? [];
    }

    private writeOntoFile(postDTO: PostDTO, content: string): void {
        const innerFile = new TextEncoder().encode(matter.stringify(content, postDTO.frontmatter));
        fs.writeFileSync(postDTO.uri.fsPath, innerFile);
    }
}