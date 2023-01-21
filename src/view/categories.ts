import * as vscode from "vscode";
import { CategoryProvider } from "../model/category.provider";
import type { Category } from "../model/category";
import { Page } from "../model/page";
import { Logable, Logger } from "../util/logger";

export class CategoriesView extends CategoryProvider implements Logable {
    private static instance?: CategoriesView;

    public static use() {
        CategoriesView.instance = new CategoriesView();
    }

    public static getInstance(): CategoriesView {
        if (CategoriesView.instance === undefined) {
            throw new Error(`${CategoriesView.name} is not used.`);
        }
        return CategoriesView.instance;
    }

    public readonly viewId = 'jekyll-n-hyde.view.categories';
    public readonly viewOptions: vscode.TreeViewOptions<Category | Page> = {
        showCollapseAll: true,
        treeDataProvider: this,
    }
    public readonly view: vscode.TreeView<Category | Page>;
    public logger = new Logger('view.categories');

    private constructor() {
        super();
        this.logger.info(`initializing ${CategoriesView.name}.`);
        this.view = vscode.window.createTreeView(this.viewId, this.viewOptions);
        this.subscribeActiveTextEditor();
        this.update();
    }

    private subscribeActiveTextEditor = () => {
        this.logger.info(`subscribe event : onDidChangeActiveTextEditor.`);
        vscode.window.onDidChangeActiveTextEditor(this.onDidChangeActiveTextEditor, this);
    }

    private onDidChangeActiveTextEditor = (textEditor: vscode.TextEditor | undefined) => {
        if (textEditor?.document.uri === undefined || !this.view.visible) {
            return;
        }
        this.revealPageByUri(textEditor.document.uri);
    }

    private revealPageByUri = (uri: vscode.Uri) => {
        this.pageRepository.findById(Page.predictId(uri)).ifPresent(this.revealPage);
    }

    private revealPage = (page: Page) => {
        this.view.reveal(page);
    }
}