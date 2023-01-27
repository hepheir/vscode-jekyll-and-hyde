import * as path from "path";
import * as vscode from "vscode";
import * as matter from "gray-matter";
import type { Comparable, Copyable, Dragable, Dropable } from "../util/object";
import type { RepositoryItem } from "../util/repository";
import { FileSystem } from "./fs";
import { Logger } from "../util/logger";

export class Page implements RepositoryItem<Page>, Comparable<Page>, Copyable<Page>, Dragable, Dropable, vscode.TreeItem {
    public static readonly dragMimeType = 'application/jekyll-n-hyde.model.post';
    public static readonly dropMimeType = 'application/jekyll-n-hyde.model.post';

    public static predictId(uri: vscode.Uri): string {
        return uri.fsPath;
    }

    public static createBasename(title: string, date: Date): string {
        return [
            date.getFullYear().toString().padStart(4, '0'),
            (date.getMonth()+1).toString().padStart(2, '0'),
            date.getDate().toString().padStart(2, '0'),
            title.replace(/[/\\?%*:|"<>.,;= ]/g, '-').trim()+'.md',
        ].join('-');
    }

    public readonly collapsibleState = vscode.TreeItemCollapsibleState.None;
    public readonly contextValue = 'jekyll-n-hyde.model.post';
    public readonly command: vscode.Command;
    public readonly dragMimeType = Page.dragMimeType;
    public readonly dropMimeType = Page.dropMimeType;
    public readonly resourceUri: vscode.Uri;
    public logger = new Logger('model.page');
    private readonly basenameParser = /((?<date>[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9])-)?(?<title>.+)\.(md)|(markdown)|(html)/;
    private readonly frontmatter: { [key: string]: any };
    private readonly fileSystem = FileSystem.instance;

    constructor(
        uri: vscode.Uri,
        frontmatter: object = {},
    ) {
        this.command = {
            command: 'vscode.open',
            title: "Open File",
            arguments: [uri],
        };
        this.resourceUri = uri;
        this.frontmatter = frontmatter;
    }

    get description() {
        return this.name;
    }

    get label() {
        return this.title;
    }

    get iconPath() {
        return this.published
            ? vscode.ThemeIcon.File
            : new vscode.ThemeIcon('lock');
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
        const ext = path.extname(this.resourceUri.path);
        return this.resourceUri.path.substring(0, -ext.length);
    }

    /**
     * The list of categories to which this post belongs.
     * Categories are derived from the directory structure above the `_posts` directory.
     * For example, a post at `/work/code/_posts/2008-12-24-closures.md` would have this field set to `['work', 'code']`.
     * These can also be specified in the front matter.
     */
    get categories(): string[] {
        // TODO: derive categories from the directory structure above the `_posts` directory.
        return this.frontmatter.categories?.slice() ?? [];
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
            ?? path.dirname(this.resourceUri.path);
    }

    /**
     * The filename of the post or page, e.g. `about.md`
     */
    get name(): string {
        return path.basename(this.resourceUri.path);
    }

    /**
     * The path to the raw post or page.
     * Example usage: Linking back to the page or post’s source on GitHub.
     * This can be overridden in the front matter.
     */
    get path(): string {
        return this.frontmatter.path
            ?? this.resourceUri.path;
    }

    set path(x: string) {
        this.frontmatter.path = x;
    }

    /**
     * Set to false if you don’t want a specific post to show up when the site is generated.
     */
    get published(): boolean {
        return this.frontmatter.published
            ?? true;
    }

    set published(x: boolean) {
        this.frontmatter.published = x;
    }

    setDate = (date: Date) => {
        const timezone = -date.getTimezoneOffset();
        const timezoneSign = (timezone >= 0) ? '+' : '-';
        const timezoneISOString = date.getFullYear() +
            '-' + (date.getMonth() + 1).toString().padStart(2, '0') +
            '-' + (date.getDate()).toString().padStart(2, '0') +
            'T' + (date.getHours()).toString().padStart(2, '0') +
            ':' + (date.getMinutes()).toString().padStart(2, '0') +
            ':' + (date.getSeconds()).toString().padStart(2, '0') +
            timezoneSign + (Math.floor(Math.abs(timezone) / 60)).toString().padStart(2, '0') +
            ':' + (Math.abs(timezone) % 60).toString().padStart(2, '0');
        this.date = timezoneISOString;
    }

    getItemId = () => {
        return Page.predictId(this.resourceUri);
    }

    copy = () => {
        this.logger.debug(`creating replica of ${this}.`);
        return new Page(this.resourceUri, Object.assign({}, this.frontmatter));
    }

    compareTo = (x: Page) => {
        return this.title.localeCompare(x.title);
    }

    render = (withoutContent: boolean = false) => {
        this.logger.info(`rendering ${this}.`);
        const content = withoutContent
            ? ''
            : matter(this.fileSystem.read(this.resourceUri)).content;
        return matter.stringify(content, this.frontmatter);
    }

    toString = () => {
        return `<Page "${this.title}"> (at category "${this.categories.join('/')}")`;
    }
}