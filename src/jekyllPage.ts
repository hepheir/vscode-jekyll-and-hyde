import { Uri } from 'vscode';
import { Page, FrontMatter } from 'jekyll';
import { Dirent, PathLike, readdirSync, readFileSync } from 'fs';
import * as yaml from 'yamljs';
import * as path from 'path';
import { JekyllSite } from './jekyllSite';


export class JekyllPage implements Page {
    private raw_content: string;
    private data: FrontMatter;

    constructor(
        private readonly site: JekyllSite,
        private readonly uri: Uri
    ) {
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
