import * as path from "path";
import {
    FileType,
    Uri,
    workspace
} from "vscode";
import { Page, Site } from "jekyll";
import { PageParser } from "./pageParser";

export class SiteParser {
    private static source: Uri = Uri.parse('/');

    public static async from(uri: Uri): Promise<Site> {
        this.source = uri;

        const drafts = await this.getPagesFrom(Uri.joinPath(uri, '_drafts'), true);
        const pages = await this.getPagesFrom(Uri.joinPath(uri, '_pages'), true);
        const posts = await this.getPagesFrom(Uri.joinPath(uri, '_posts'), true);
        const categories = this.getCategoriesFrom([...drafts, ...pages, ...posts]);

        return {
            time: new Date(Date.now()),
            pages: [...pages],
            posts: [...posts, ...drafts],
            categories: categories
        };
    }

    private static async getPagesFrom(uri: Uri, recursive: boolean = false): Promise<Page[]> {
        const MARKDOWN_EXTS = ['.md', '.markdown'];
        const entries = await workspace.fs.readDirectory(uri);
        // Parse current directory markdowns
        const files = entries.filter(([name, type]) => type == FileType.File);
        const markdowns = files.filter(([name, type]) => MARKDOWN_EXTS.includes(path.extname(name)));
        const parsingFiles = markdowns.map(async ([name, type]) => PageParser.from(Uri.joinPath(uri, name), this.source));
        if (!recursive) {
            return await Promise.all(parsingFiles);
        }
        // Parse deeper directories
        const directories = entries.filter(([name, type]) => type == FileType.Directory);
        const parsingDirectories = directories.map(async ([name, type]) => this.getPagesFrom(Uri.joinPath(uri, name), recursive));
        // Concatenate both results
        return Promise.all(parsingFiles).then(async pages => {
            return await Promise.all(parsingDirectories).then(combinedPages => pages.concat(...combinedPages));
        });
    }

    private static getCategoriesFrom(pages: Page[]): { [key: string]: Page[] } {
        const categories: { [key: string]: Page[] } = {};
        pages.forEach(p => p.categories.forEach(categoryName => {
            if (categoryName in categories) {
                categories[categoryName].push(p);
                return;
            }
            categories[categoryName] = [p];
        }));
        return categories;
    }
}
