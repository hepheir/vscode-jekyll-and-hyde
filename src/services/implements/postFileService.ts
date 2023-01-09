import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import type { PostDTO } from "../../models/post/postDTO";
import type { PostService } from "../postService";
import { PostDTOBuilder } from "../../models/post/postDTOBuilder";
import { PostFileWriter } from "../../models/post/postFileWriter";
import type { Writer } from "../../util/writer";

export class PostFileService implements PostService {
    public static readonly instance = new PostFileService();

    private constructor() { }

    create = (title: string, categories: readonly string[], uri?: vscode.Uri | undefined) => {
        uri = uri ?? this.generateUniqueUri(title);
        const postDTO: PostDTO = new PostDTOBuilder()
            .setUri(uri)
            .setTitle(title)
            .setCategories(categories)
            .build();
        const writer: Writer<PostDTO> = new PostFileWriter();
        writer.write(postDTO);
        return postDTO;
    }

    private generateUniqueUri = (title: string) => {
        let uri: vscode.Uri = this.generateUri(title);
        for (let i = 0; fs.existsSync(uri.fsPath); i++) {
            uri = this.generateUri(this.addNumbering(title, i));
        }
        return uri;
    }

    private generateUri = (title: string) => {
        const workspaceFolder: string | undefined = vscode.workspace.workspaceFolders?.[0].uri.path;
        if (!workspaceFolder) {
            throw new Error();
        }
        const basename = this.generateBasename(title);
        return vscode.Uri.file(path.join(workspaceFolder!, '_drafts', basename));
    }

    private generateBasename = (title: string) => {
        const date = new Date();
        const ext = '.md';
        const basename = [
            this.pad(date.getFullYear()),
            this.pad(date.getMonth()+1),
            this.pad(date.getDate()),
            this.escapeFilename(title)
        ].join('-');
        return basename + ext;
    }

    private pad = (x: number) => {
        return (x < 10) ? ('0'+x.toString()) : x.toString();
    }

    private escapeFilename = (value: string) => {
        return value.replace(/[^\w-\(\)]/g, '-').toLowerCase();
    }

    private addNumbering = (title: string, nth: number) => {
        return (nth == 0) ? title : title + ' (' + nth.toString() + ')';
    }
}