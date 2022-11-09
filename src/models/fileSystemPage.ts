import * as fs from "fs"
import * as path from "path"
import * as vscode from "vscode";
import * as matter from "gray-matter"
import Page from "./page";


export default class FileSystemPage implements Page {
    private readonly _uri: vscode.Uri;
    private readonly _content: string;
    private readonly _data: {[key: string]: any};
    private readonly _excerpt?: string;

    constructor(uri: vscode.Uri) {
        const { content, data, excerpt } = matter.read(uri.fsPath);
        this._uri = uri;
        this._content = content;
        this._data = data;
        this._excerpt = excerpt;
    }

    get uri(): vscode.Uri {
        return this._uri;
    }

    get title(): string {
        return this._data.title
            ?? this.getTitleFromFilename();
    }

    private getTitleFromFilename(): string {
        const regexp = /^(?<=([0-9]{4}-[0-9]{2}-[0-9]{2}-)?).+/g;
        const filename = path.basename(this._uri.path);
        if (!regexp.test(filename)) {
            return filename;
        }
        return filename.match(regexp)![0];
    }

    get content(): string {
        return this._content;
    }

    get excerpt(): string {
        return this._excerpt
            ?? '';
    }

    get categories(): string[] {
        return this._data.categories
            ?? this.getCategories()
            ?? [];
    }

    private getCategories(): string[] {
        const categories: string[] = [];
        const workspaceFolder = vscode.workspace.workspaceFolders![0];
        const relPath = path.relative(workspaceFolder.uri.path, this._uri.path);
        for (const category of relPath.split(path.sep)) {
            if (category == '_posts')
                break;
            if (category == '_drafts')
                break;
            categories.push(category);
        }
        return categories;
    }

    get date(): string {
        return this._data.date
            ?? this.getDateFromFilename()
            ?? new Date().toISOString();
    }

    private getDateFromFilename(): string | null {
        const regexp = /^[0-9]{4}-[0-9]{2}-[0-9]{2}(?=-)/g;
        const filename = path.basename(this._uri.path);
        if (!regexp.test(filename)) {
            return null;
        }
        return filename.match(regexp)![0];
    }

    get dir(): string {
        return this._data.permalink
            ?? path.dirname(this._uri.path);
    }

    get name(): string {
        return path.basename(this._uri.path);
    }

    get path(): string {
        return this._data.path
            ?? this._uri.path;
    }

    get published(): boolean {
        return this._data.published
            ?? this.getDateFromFilename() !== null;
    }

}