import { Uri, window } from 'vscode';
import { Site, Page } from 'jekyll';
import { Dirent, PathLike, readdirSync } from 'fs';
import * as path from 'path';
import { JekyllPage } from './jekyllPage';


export class JekyllSite implements Site {
    source: string;

    constructor(source: string) {
        this.source = source;
    }

    get time(): Date {
        return new Date(Date.now());
    }

    get pages(): Page[] {
        const pages: Page[] = [];
        const dir = path.join(this.source, '_pages');
        this.addAllPagesTo(pages, dir);
        return pages;
    }

    get posts(): Page[] {
        const pages: Page[] = [];
        const postDir = path.join(this.source, '_posts');
        const draftDir = path.join(this.source, '_drafts');
        this.addAllPagesTo(pages, postDir);
        this.addAllPagesTo(pages, draftDir);
        return pages;
    }

    get categories(): { [CATEGORY: string]: Page[] } {
        function grepPages(pages: Page[], category: string): Page[] {
            return pages.filter((p: Page) => p.categories.includes(category))
        }
        const categoryNames: Set<string> = new Set();

        this.posts.forEach((page: Page) => {
            if (page === null) {
                return;
            } else {
                page.categories.forEach((category: string) => {
                    categoryNames.add(category);
                })
            }
        });

        const categories: { [CATEGORY: string]: Page[] } = {};

        categoryNames.forEach((categoryName: string) => {
            const category: Page[] = [];

            grepPages(this.pages, categoryName).forEach((p: Page) => category.push(p));
            grepPages(this.posts, categoryName).forEach((p: Page) => category.push(p));

            categories[categoryName] = category;
        });
        return categories;
    }

    private addAllPagesTo(pages: Page[], dir: PathLike, failedUris: Uri[] = []) {
        searchAllMarkdownUris(dir).forEach((uri: Uri) => {
            try {
                pages.push(new JekyllPage(this, uri));
            } catch (error) {
                window.showErrorMessage(`Failed to parse Jekyll Page: ${uri.path}`)
                failedUris.push(uri);
            }
        });
    }
}


function getDateStringOfNow(): string {
    const now = new Date(Date.now());
    const y = now.getFullYear().toString().padStart(4, '0');
    const m = (now.getMonth() + 1).toString().padStart(2, '0');
    const d = now.getDate().toString().padStart(2, '0');
    return [y, m, d].join('-');
}


function searchAllFiles(dir: PathLike): string[] {
    const stack: string[] = [];

    function dfs(dir: PathLike): void {
        const dirents: Dirent[] = readdirSync(dir, { withFileTypes: true });

        const fileDirents = dirents.filter((d: Dirent) => d.isFile());
        const dirDirents = dirents.filter((d: Dirent) => d.isDirectory())

        const filePaths = fileDirents.map((d: Dirent) => path.join(dir.toString(), d.name));
        const dirPaths = dirDirents.map((d: Dirent) => path.join(dir.toString(), d.name));

        filePaths.forEach((p: string) => stack.push(p));
        dirPaths.forEach((p: string) => dfs(p));
    }

    dfs(dir);
    return stack;
}


function searchAllMarkdownUris(dir: PathLike): Uri[] {
    const files = searchAllFiles(dir);
    const markdowns = files.filter((p: string) => ['.md', '.markdown'].includes(path.parse(p).ext));
    const markdownUris = markdowns.map((p: string) => Uri.file(p));
    return markdownUris;
}
