import * as path from "path";
import * as matter from "gray-matter";
import {
    Uri,
    workspace
} from "vscode";
import { Page } from "jekyll";


export class PageParser {
    public static async from(uri: Uri, source: Uri = Uri.parse('/')): Promise<Page> {
        const content = (await workspace.fs.readFile(uri)).toString();
        const file = matter(content, { excerpt: true });
        return {
            content: file.content,
            title: file.data.title ?? '*Untitled',
            excerpt: file.excerpt ?? '',
            date: file.data.date ?? '9999-01-01',
            categories: file.data.categories ?? [],
            dir: file.data.permalink
                ? path.dirname(file.data.permalink)
                : path.relative(source.fsPath, path.dirname(uri.fsPath)),
            name: path.basename(uri.path),
            path: file.data.path ?? uri.path
        };
    }
}
