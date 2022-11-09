import * as vscode from "vscode";
import PageLoader, { PageLoaderSubscriber } from "./pageLoader";
import Page from "./page";
import FileSystemPage from "./fileSystemPage";

export default class FileSystemPageLoader implements PageLoader {
    private readonly _onDidLoad = new vscode.EventEmitter<Page[]>();
    private readonly globPatterns = {
        posts: '**/_posts/**/[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]-*.{md,markdown,html}',
        drafts: '**/_drafts/**/*.{md,markdown,html}',
    };

    constructor() {
        this.load = this.load.bind(this);
        this.createFSWatchers();
    }

    private createFSWatchers() {
        for (const globPattern of Object.values(this.globPatterns)) {
            const watcher = this.createFSWatcherViaGlobPattern(globPattern);
            this.initFSWatcher(watcher);
        }
    }

    private createFSWatcherViaGlobPattern(globPattern: string): vscode.FileSystemWatcher {
        const workspaceFolder = vscode.workspace.workspaceFolders![0];
        const relPattern = new vscode.RelativePattern(workspaceFolder, globPattern);
        return vscode.workspace.createFileSystemWatcher(relPattern);
    }

    private initFSWatcher(watcher: vscode.FileSystemWatcher) {
        watcher.onDidCreate(this.load);
        watcher.onDidChange(this.load);
        watcher.onDidDelete(this.load);
    }

    get onDidLoad(): vscode.Event<Page[]> {
        return this._onDidLoad.event;
    }

    load() {
        this._load();
    }

    private async _load() {
        let pages: Page[] = [];
        for (const globPattern of Object.values(this.globPatterns)) {
            pages = pages.concat(await this.loadViaGlobPattern(globPattern));
        }
        this._onDidLoad.fire(pages)
    }

    private async loadViaGlobPattern(globPattern: string): Promise<Page[]> {
        const pages: Page[] = [];
        for (const uri of await vscode.workspace.findFiles(globPattern)) {
            try {
                pages.push(new FileSystemPage(uri));
            } catch (err) {
                console.warn(err);
            }
        }
        return pages;
    }

    addSubscriber(subscriber: PageLoaderSubscriber): void {
        subscriber.usePageLoader(this);
    }
}