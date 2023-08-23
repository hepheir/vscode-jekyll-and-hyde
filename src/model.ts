import * as matter from "gray-matter";
import * as path from "path";
import * as vscode from "vscode";


export class Post {
    public readonly parent: Category;
    public readonly uri: vscode.Uri;

    public readonly title: string;
    public readonly categories: string[];
    public readonly date: string;
    public readonly draft: boolean = false;

    constructor(parent: Category, uri: vscode.Uri) {
        this.parent = parent;
        this.uri = uri;

        const frontmatter = matter.read(this.uri.fsPath).data;
        const filename = /((?<date>\d{4}-\d{2}-\d{2})-)?(?<title>.+)\.(md)|(markdown)|(html)/.exec(path.basename(this.uri.path))!.groups!;

        this.title = frontmatter?.title ?? filename.title;
        this.date = frontmatter?.date ?? filename?.date ?? new Date(Date.now()).toISOString();
        this.categories = [];

        if (typeof (frontmatter.category) == 'string') {
            this.categories = [frontmatter.category];
        }
        if (Array.isArray(frontmatter.categories)) {
            this.categories = frontmatter.categories;
        }

        // @ts-ignore
        matter.clearCache();
    }
}


export class Category {
    public parent: Category;
    public category: { [name: string]: Category };
    public post: { [title: string]: Post };
    public name: string;
    public path: string;

    constructor(parent: Category, name: string) {
        this.parent = parent;
        this.name = name;
        this.category = {};
        this.post = {};
        this.path = (parent?.path ?? '') + '/' + name;
    }

    public getOrCreateCategory(category: string[]): Category {
        const name = category.shift();
        if (name === undefined) {
            return this;
        }
        if (!(name in this.category)) {
            this.category[name] = new Category(this, name);
        }
        return this.category[name].getOrCreateCategory(category);
    }

    public addPost(post: Post) {
        this.post[post.title] = post;
    }

    public countCategories = (recursive?: boolean) => {
        var count = Object.keys(this.category).length;
        if (recursive) {
            for (const category of Object.values(this.category)) {
                count += category.countCategories(recursive);
            }
        }
        return count;
    }

    public countPosts = (recursive?: boolean) => {
        var count = Object.keys(this.post).length;
        if (recursive) {
            for (const category of Object.values(this.category)) {
                count += category.countPosts(recursive);
            }
        }
        return count;
    }
}


export class Site extends Category {
    private static readonly globPattern = {
        include: '**/*.{md,markdown,html}',
        exclude: '{_site,_layouts,_includes}/**/*.{md,markdown,html}',
    };

    private readonly relPattern: {
        include: vscode.RelativePattern,
        exclude: vscode.RelativePattern,
    };

    public readonly workspace: vscode.WorkspaceFolder;
    public readonly watcher: vscode.FileSystemWatcher;

    constructor(workspace: vscode.WorkspaceFolder) {
        super(null!, workspace.name);
        this.workspace = workspace;
        this.relPattern = {
            include: new vscode.RelativePattern(workspace, Site.globPattern.include),
            exclude: new vscode.RelativePattern(workspace, Site.globPattern.exclude),
        };
        this.watcher = vscode.workspace.createFileSystemWatcher(this.relPattern.include);
        // TODO: add file system watchers
        this.watcher.onDidCreate(uri => console.log('create', uri));
        this.watcher.onDidChange(uri => console.log('change', uri));
        this.watcher.onDidDelete(uri => console.log('delete', uri));
    }

    clear = () => {
        // TODO: re-use allocated resources.
        this.category = {};
        this.post = {};
    }

    update = async (callback?: (value: vscode.Uri, index: number, array: vscode.Uri[]) => any) => {
        const uris = await vscode.workspace.findFiles(this.relPattern.include, this.relPattern.exclude);
        uris.forEach((value, index, array) => {
            this.updatePartial(value);
            callback?.(value, index, array);
        }, this);
    }

    updatePartial = (uri: vscode.Uri) => {
        try {
            const post = new Post(this, uri);
            const category = this.getOrCreateCategory(post.categories);
            category.addPost(post);
        } catch (err) {
            console.error(err);
        }
    }
}
