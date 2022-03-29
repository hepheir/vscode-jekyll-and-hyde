import * as path from "path";
import * as matter from "gray-matter";
import {
    Uri,
    workspace
} from "vscode";
import { Page } from "jekyll";
import { PostNameParser } from "./postNameParser";


export class PageParser {
    public static async from(uri: Uri): Promise<Page> {
        const content = (await workspace.fs.readFile(uri)).toString();
        const file = matter(content, { excerpt: true });
        const page: Page = {
            content: file.content,
            title: file.data.title ?? workspace.asRelativePath(uri),
            excerpt: file.excerpt ?? '',
            date: file.data.date
                || new Date(PostNameParser.parse(uri).date)
                || new Date(Date.now()),
            categories: file.data.categories
                ?? ( file.data.category ? [file.data.category] : [] ),
            dir: file.data.permalink
                ? path.dirname(file.data.permalink)
                : workspace.asRelativePath(uri),
            name: path.basename(uri.path),
            path: file.data.path ?? uri.path
        };
        return page;
    }
}
