import * as fs from "fs";
import * as vscode from "vscode";
import * as matter from "gray-matter";
import type { PostDTO } from "./postDTO";
import { PostDTOBuilder } from "./postDTOBuilder";
import type { Reader } from "../../common/reader";
import { ReaderError } from "../../common/readerError";

export class PostFileReader implements Reader<PostDTO> {
    constructor(
        private readonly uri: vscode.Uri,
    ) { }

    read(): PostDTO {
        if (!fs.existsSync(this.uri.fsPath)) {
            throw vscode.FileSystemError.FileNotFound(this.uri);
        }
        const content = fs.readFileSync(this.uri.fsPath).toString();
        this.checkReadable(content);
        const file = matter(content);
        return new PostDTOBuilder()
            .setUri(this.uri)
            .setCategories(file.data?.categories ?? [])
            .setFrontmatter(file.data)
            .build();
    }

    private checkReadable(content: string) {
        if (!matter.test(content)) {
            throw new ReaderError.NotReadableException("Front matter not found.");
        }
    }
}