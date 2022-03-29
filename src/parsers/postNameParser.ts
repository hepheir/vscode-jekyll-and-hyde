import * as path from "path";
import { Uri } from "vscode";

export interface ParsedPostName {
    date: string,
    title: string,
}


export class PostNameParser {
    private static readonly DATE_REGEXP = /(?<=^)([0-9]{4}|[0-9]{2})-[0-9]{2}-[0-9]{2}(?=-)/;
    private static readonly TITLE_REGEXP = /(?<=^([0-9]{4}|[0-9]{2})-[0-9]{2}-[0-9]{2}-).+/;

    public static parse(resource: string | Uri): ParsedPostName {
        const isUri = resource instanceof Uri;
        const basename = path.basename(isUri ? resource.fsPath : resource);
        return this.parseBasename(basename);
    }

    private static parseBasename(basename: string): ParsedPostName {
        const date = this.parseDateFromBasename(basename);
        const title = this.parseTitleFromBasename(basename);
        return { date: date, title: title, };
    }

    private static parseDateFromBasename(basename: string): string {
        const matches = basename.match(this.DATE_REGEXP);
        return matches === null ? '' : matches[0];
    }

    private static parseTitleFromBasename(basename: string): string {
        const matches = basename.match(this.TITLE_REGEXP);
        return matches === null ? '' : matches[0];
    }

    public static addDatePrefix(resource: Uri, option?: { overwrite?: boolean }): Uri;
    public static addDatePrefix(resource: string, option?: { overwrite?: boolean }): string;
    public static addDatePrefix(resource: Uri | string, option?: { overwrite?: boolean }): Uri | string {
        const isUri = resource instanceof Uri;
        var fsPath = isUri ? resource.fsPath : resource;
        const dirname = path.dirname(fsPath);
        const basename = path.basename(fsPath);
        if (option && !option.overwrite && this.parseDateFromBasename(basename).length > 0) {
            // do nothing.
        } else {
            fsPath = path.join(dirname, this.addDatePrefixToBasename(basename));
        }
        return isUri ? Uri.file(fsPath) : fsPath;
    }

    private static addDatePrefixToBasename(basename: string, date: Date | undefined = undefined): string {
        return [this.createDate(date), basename].join('-');
    }

    public static createDate(date: Date | undefined = undefined): string {
        const d = date ?? new Date(Date.now());
        const yyyy = d.getUTCFullYear();
        const mm = (d.getUTCMonth()+1).toString().padStart(2, '0');
        const dd = d.getUTCDate().toString().padStart(2, '0');
        return [yyyy, mm, dd].join('-');
    }

    public static draftToPost(resource: Uri): Uri;
    public static draftToPost(resource: string): string;
    public static draftToPost(resource: Uri | string): Uri | string {
        const isUri = resource instanceof Uri;
        var fsPath = isUri ? resource.fsPath : resource;
        fsPath = fsPath.replace('_drafts', '_posts');
        fsPath = this.addDatePrefix(fsPath, { overwrite: false });
        return isUri ? Uri.file(fsPath) : fsPath;
    }

    public static postToDraft(resource: Uri): Uri;
    public static postToDraft(resource: string): string;
    public static postToDraft(resource: Uri | string): Uri | string {
        const isUri = resource instanceof Uri;
        var fsPath = isUri ? resource.fsPath : resource;
        fsPath = fsPath.replace('_posts', '_drafts');
        return isUri ? Uri.file(fsPath) : fsPath;
    }
}
