import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import type { PostDTO } from "../models/postDTO";
import { PostDTOBuilder } from "../models/postDTOBuilder";
import { PostFileWriter } from "../models/postFileWriter";
import type { Writer } from "../util/writer";

export class PostFileService {
    public static readonly instance = new PostFileService();

    private readonly writer: Writer<PostDTO> = new PostFileWriter();

    private constructor() { }

    create = (title: string, categories: readonly string[], uri?: vscode.Uri | undefined) => {
        uri = uri ?? this.generateUniqueUri(title);
        const postDTO: PostDTO = new PostDTOBuilder()
            .setUri(uri)
            .setTitle(title)
            .setCategories(categories)
            .build();
        this.writer.write(postDTO);
        vscode.window.showTextDocument(uri);
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
        return vscode.Uri.file(path.join(workspaceFolder!, '_posts', basename));
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