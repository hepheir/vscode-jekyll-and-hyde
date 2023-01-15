import * as fs from "fs";
import * as path from "path";
import { TextEncoder } from "util";
import * as vscode from "vscode";
import * as matter from "gray-matter";
import type { Comparable } from "../util/util";
import {
    CrudRepository,
    RepositoryItem,
    SortedArrayCrudRepository,
} from "../util/repository";

class PageReader {
    public static readonly instance = new PageReader();

    read(page: Page) {
        const file = this.readFile(page.uri);
        page.frontmatter = file.data;
        console.log(`successfully read post <${page.uri.path}>.`);
        return file;
    }

    readable(page: Page) {
        if (!fs.existsSync(page.uri.fsPath)) {
            return false;
        }
        const content = fs.readFileSync(page.uri.fsPath).toString();
        return matter.test(content);
    }

    private readFile(uri: vscode.Uri) {
        if (!fs.existsSync(uri.fsPath)) {
            console.error(`could not read post <${uri.path}> : file not found.`);
            throw vscode.FileSystemError.FileNotFound(uri);
        }
        const content = fs.readFileSync(uri.fsPath).toString();
        if (!matter.test(content)) {
            console.error(`could not read post <${uri.path}> : frontmatter not found.`);
            throw new Error();
        }
        return matter(content);
    }
}

class PageWriter {
    public static readonly instance = new PageWriter();

    write(page: Page) {
        const content = matter.stringify(page.content, page.frontmatter);
        fs.writeFileSync(page.uri.fsPath, new TextEncoder().encode(content));
    }
}

class Page implements RepositoryItem<Page>, Comparable<Page> {
    private readonly basenameParser = /((?<date>[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9])-)?(?<title>.+)\.(md)|(markdown)|(html)/;
    private readonly reader = PageReader.instance;
    private readonly writer = PageWriter.instance;

    public uri: vscode.Uri;
    public frontmatter: { [key: string]: any };

    /**
     * The content of the Page, rendered or un-rendered depending upon what Liquid is being processed and what `Page` is.
     */
    get content(): string {
        if (this.reader.readable(this)) {
            return this.reader.read(this).content;
        }
        return '';
    }

    /**
     * The title of the Page.
     */
    get title(): string {
        return this.frontmatter.title
            ?? this.basenameParser.exec(this.name)!.groups!.title;
    }

    set title(x: string) {
        this.frontmatter.title = x;
    }

    /**
     * The Date assigned to the Post.
     * This can be overridden in a Post’s front matter by specifying a new date/time in the format `YYYY-MM-DD HH:MM:SS` (assuming UTC), or `YYYY-MM-DD HH:MM:SS +/-TTTT` (to specify a time zone using an offset from UTC. e.g. `2008-12-14 10:30:00 +0900`).
     */
    get date(): string {
        return this.frontmatter.date
            ?? this.basenameParser.exec(this.name)!.groups!.date;
    }

    set date(x: string) {
        this.frontmatter.date = x;
    }

    /**
     * An identifier unique to a document in a Collection or a Post (useful in RSS feeds).
     * e.g. `/2008/12/14/my-post/my-collection/my-document`
     */
    get id(): string {
        const ext = path.extname(this.uri.path);
        return this.uri.path.substring(0, -ext.length);
    }

    /**
     * The list of categories to which this post belongs.
     * Categories are derived from the directory structure above the `_posts` directory.
     * For example, a post at `/work/code/_posts/2008-12-24-closures.md` would have this field set to `['work', 'code']`.
     * These can also be specified in the front matter.
     */
    get categories(): string[] {
        // TODO: derive categories from the directory structure above the `_posts` directory.
        return this.frontmatter.categories ?? [];
    }

    set categories(x: string[]) {
        this.frontmatter.categories = x;
    }

    /**
     * The label of the collection to which this document belongs.
     * e.g. `posts` for a post, or `puppies` for a document at path `_puppies/rover.md`.
     * If not part of a collection, an empty string is returned.
     */
    get collection(): string {
        // TODO: parse collection from directory structure.
        return this.frontmatter.collection
            ?? '';
    }

    /**
     * The path between the source directory and the file of the post or page, e.g. `/pages/`.
     * This can be overridden by `permalink` in the front matter.
     */
    get dir(): string {
        return this.frontmatter.permalink
            ?? path.dirname(this.uri.path);
    }

    /**
     * The filename of the post or page, e.g. `about.md`
     */
    get name(): string {
        return path.basename(this.uri.path);
    }

    /**
     * The path to the raw post or page.
     * Example usage: Linking back to the page or post’s source on GitHub.
     * This can be overridden in the front matter.
     */
    get path(): string {
        return this.frontmatter.path
            ?? this.uri.path;
    }

    set path(x: string) {
        this.frontmatter.path = x;
    }

    constructor(uri: vscode.Uri, frontmatter: object = {}) {
        this.uri = uri;
        this.frontmatter = frontmatter;
    }

    getId = () => {
        return this.uri.fsPath;
    }

    copy = () => {
        const copied = new Page(this.uri);
        copied.frontmatter = this.frontmatter;
        return copied;
    }

    compareTo(x: Page): number {
        return this.title.localeCompare(x.title);
    }

    read = () => {
        this.reader.read(this);
    }

    write = () => {
        this.writer.write(this);
    }
}

class PageRepository extends SortedArrayCrudRepository<Page> implements CrudRepository<Page> {
    public static readonly instance = new PageRepository();

    private constructor() {
        console.log(`initializing page repository.`);
        super();
    }
}

export {
    Page,
    PageRepository,
};