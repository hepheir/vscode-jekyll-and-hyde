import * as vscode from "vscode";
import PageRepository from "./pageRepository";
import FileSystemPage from "./fileSystemPage";
import Page from "./page";


export default class FileSystemPageRepository implements PageRepository {
    private readonly _onDidLoad = new vscode.EventEmitter<PageRepository>();
    private readonly globPatterns = {
        posts: '_posts/**/[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]-*.{md,markdown,html}',
        drafts: '_drafts/**/*.{md,markdown,html}',
    };
    private pages: FileSystemPage[] = [];

    constructor() {
        this.load = this.load.bind(this);
        this.loadViaGlobPattern = this.loadViaGlobPattern.bind(this);
        this.tryAddPage = this.tryAddPage.bind(this);
        this.createFSWatchers();
    }

    private createFSWatchers() {
        for (const globPattern of Object.values(this.globPatterns)) {
            const watcher = this.createFSWatcherViaGlobPattern(globPattern);
            this.initFSWatcher(watcher);
        }
    }

    private createFSWatcherViaGlobPattern(globPattern: string): vscode.FileSystemWatcher {
        const relPattern = new vscode.RelativePattern(vscode.workspace.workspaceFolders![0], globPattern);
        return vscode.workspace.createFileSystemWatcher(relPattern);
    }

    private initFSWatcher(watcher: vscode.FileSystemWatcher) {
        watcher.onDidCreate(this.load);
        watcher.onDidChange(this.load);
        watcher.onDidDelete(this.load);
        // watcher.dispose();
    }

    get onDidLoad() {
        return this._onDidLoad.event;
    }

    load() {
        this.clear();
        this.loadViaGlobPatterns();
    }

    private clear() {
        this.pages = [];
    }

    private async loadViaGlobPatterns() {
        for (const globPattern of Object.values(this.globPatterns)) {
            await this.loadViaGlobPattern(globPattern);
        }
        this._onDidLoad.fire(this);
    }

    private async loadViaGlobPattern(globPattern: string) {
        const uris = await vscode.workspace.findFiles(globPattern);
        for (const uri of uris) {
            this.tryAddPage(uri);
        }
    }

    private tryAddPage(uri: vscode.Uri) {
        try {
            const page = new FileSystemPage(uri);
            this.pages.push(page);
        } catch (err) {
            console.warn(err);
        }
    }

    findAllCategories(): string[] {
        const hashSet: {[key: string]: null} = {};
        for (const page of this.pages) {
            page.categories.forEach(category => hashSet[category] = null);
        }
        return Object.keys(hashSet).sort();
    }

    findAllPagesByCategory(category: string | void | null | undefined): Page[] {
        if (!category) {
            return this.pages.filter(page => page.categories.length == 0);
        } else {
            return this.pages.filter(page => page.categories.includes(category));
        }
    }
}