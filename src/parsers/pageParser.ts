import * as path from "path";
import * as matter from "gray-matter";
import * as vscode from "vscode";
import { Page } from "jekyll";
import { Publisher } from "../models/publisher";


export interface ParsedFileName {
    basename?: string,
    ext?: string,
    title?: string,
    date?: string,
}


export class PageParser {
    private static readonly FILE_FORMAT_REGEXP = /^(?<date>[0-9]{4}-[0-9]{2}-[0-9]{2})-(?<title>.+)\.(md)|(markdown)$/;

    /**
     *
     * @param uri Uri of page to parse.
     * @returns Parsed `Page` object wrapped with `Promise`.
     */
    public static async parse(uri: vscode.Uri): Promise<Page> {
        const buffer = await vscode.workspace.fs.readFile(uri);
        const file = matter(buffer.toString(), { excerpt: true });
        const {
            content,
            data: frontmatter,
            excerpt: generatedExcerpt,
        } = file;
        const filename = this.parseFileName(uri);

        const page: Page = {
            content: content,
            title: frontmatter.title
                || filename.title
                || vscode.workspace.asRelativePath(uri),
            excerpt: frontmatter.excerpt
                || generatedExcerpt
                || '',
            date: frontmatter.date
                || filename.date
                || Publisher.createDateFormat(),
            categories: frontmatter.categories
                || frontmatter.category && [frontmatter.category]
                || [],
            dir: frontmatter.permalink && path.dirname(frontmatter.permalink)
                || path.dirname(vscode.workspace.asRelativePath(uri)),
            name: path.basename(uri.path),
            path: frontmatter.path ?? uri.path,
        };
        return page;
    }

    /**
     * Parse filename of a page.
     *
     * @param uri
     * @returns
     */
    public static parseFileName(uri: vscode.Uri): ParsedFileName {
        const basename = path.basename(uri.path);
        const match = basename.match(this.FILE_FORMAT_REGEXP);
        const parsedFileName: ParsedFileName = {
            basename: basename,
            ext: path.extname(basename),
            title: '',
            date: new Date().toUTCString(),
        };
        if (match) {
            Object.assign(parsedFileName, match.groups);
        }
        return parsedFileName;
    }

    /**
     * Returns whether given uri is a post or not.
     *
     * @param uri Uri of the post.
     * @returns `true` or `false`
     */
    public static isPost(uri: vscode.Uri) {
        const basename = path.basename(uri.fsPath);
        const relative = vscode.workspace.asRelativePath(uri);
        const parents = relative.split(path.sep);
        return this.FILE_FORMAT_REGEXP.test(basename) && parents.includes('_posts');
    }

    /**
     * Returns whether given uri is a draft or not.
     *
     * @param uri Uri of the draft.
     * @returns `true` or `false`
     */
    public static isDraft(uri: vscode.Uri) {
        const relative = vscode.workspace.asRelativePath(uri);
        const parents = relative.split(path.sep);
        return !this.isPost(uri) && parents.includes('_posts') || parents.includes('_drafts');
    }
}
