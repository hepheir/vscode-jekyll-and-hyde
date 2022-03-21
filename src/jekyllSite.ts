import { Uri, window } from 'vscode';
import { Site, Page, FrontMatter } from 'jekyll';
import { Dirent, PathLike, readdirSync, readFileSync } from 'fs';
import * as yaml from 'yamljs';
import * as path from 'path';


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


class JekyllPage implements Page {
    private site: JekyllSite;
    private uri: Uri;
    private raw_content: string;
    private data: FrontMatter;

    constructor(site: JekyllSite, uri: Uri) {
        this.site = site;
        this.uri = uri;
        this.raw_content = readFileSync(this.uri.path).toString();
        this.data = yaml.parse(this.raw_content.split('---\n')[1]);
    }

    get content(): string {
        try {
            return this.raw_content.split('---\n').slice(2).join('\n');
        } catch (error) {
            return '';
        }
    }

    get title(): string {
        return this.data.title || this.parseTitleFromName();
    }

    get excerpt(): string {
        // TODO
        return 'Post excerpts are not supported';
    }

    get date(): string {
        return this.parseDateFromName() || this.data.date || getDateStringOfNow();
    }

    get categories(): string[] {
        try {
            if (this.data.categories) {
                if (Array.isArray(this.data.categories)) {
                    return this.data.categories;
                } else if (this.data.category) {
                    return [this.data.category];
                }
            }
        } catch (error) {

        }
        return [];
    }

    get name(): string {
        return path.basename(this.path);
    }

    get dir(): string {
        const dirName: string = path.dirname(this.path);
        return path.relative(this.site.source, dirName);
    }

    get path(): string {
        return this.uri.path;
    }

    private parseDateFromName(): string | null {
        const matches = /([0-9]{4})|([0-9]{2})\-[0-1]*[0-9]\-[0-3][0-9]/.exec(this.name);
        if (matches === null) {
            return null;
        } else {
            return matches[0];
        }
    }

    private parseTitleFromName(): string {
        var title: string = this.name;
        if (title.startsWith(this.date)) {
            title = title.substring(this.date.length + 1);
        }
        return title
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
