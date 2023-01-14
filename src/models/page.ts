import * as fs from "fs";
import * as path from "path";
import { TextEncoder } from "util";
import * as vscode from "vscode";
import * as matter from "gray-matter";
import type { Comparable } from "../util/util";
import {
    CrudRepository,
    HeapCrudRepository,
    RepositoryItem,
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

    get categories(): string[] {
        return this.frontmatter.categories ?? [];
    }

    set categories(x: string[]) {
        this.frontmatter.categories = x;
    }

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

    get path(): string {
        return this.frontmatter.path
            ?? this.uri.path;
    }

    set path(x: string) {
        this.frontmatter.path = x;
    }

    get date(): string {
        return this.frontmatter.date
            ?? this.basenameParser.exec(this.name)!.groups!.date;
    }

    set date(x: string) {
        this.frontmatter.date = x;
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

class PageRepository extends HeapCrudRepository<Page> implements CrudRepository<Page> {
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