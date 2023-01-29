import * as vscode from "vscode";
import { CategoryProvider } from "../model/category.provider";
import { Category } from "../model/category";
import { Page } from "../model/page";
import { Logable, Logger } from "../util/logger";
import { FileSystem } from "../model/fs";

type TreeItem = Category | Page;

export class CategoriesView extends CategoryProvider implements Logable, vscode.TreeDragAndDropController<TreeItem> {
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
    public readonly viewOptions: vscode.TreeViewOptions<TreeItem> = {
        canSelectMany: true,
        dragAndDropController: this,
        showCollapseAll: true,
        treeDataProvider: this,
    }
    public readonly view: vscode.TreeView<TreeItem>;
    public logger = new Logger('view.categories');

    private constructor() {
        super();
        this.logger.info(`initializing ${CategoriesView.name}.`);
        this.view = vscode.window.createTreeView(this.viewId, this.viewOptions);
        this.subscribeActiveTextEditor();
        this.update();
    }

    public readonly dropMimeTypes = [Page.dropMimeType];

    public readonly dragMimeTypes = [Page.dragMimeType];

    handleDrag = (source: readonly TreeItem[], dataTransfer: vscode.DataTransfer, token: vscode.CancellationToken) => {
        this.logger.info(`handling drag event of ${source.length} items.`);
        source.forEach(src => {
            if (src instanceof Page) {
                const dataTransferItem = dataTransfer.get(Page.dragMimeType) ?? new vscode.DataTransferItem([]);
                dataTransferItem.value.push(src);
                dataTransfer.set(Page.dragMimeType, dataTransferItem);
            }
        })
        return;
    }

    handleDrop = async (target: TreeItem | undefined, dataTransfer: vscode.DataTransfer, token: vscode.CancellationToken) => {
        this.logger.info(`handling drop event to target ${target}.`);
        if (target instanceof Page) {
            target = this.getParent(target);
        }
        if (target === undefined) {
            target = Category.getRoot();
        }
        this.logger.info(`change dropping target to ${target}.`);
        const items: Page[] = dataTransfer.get(Page.dropMimeType)?.value ?? [];
        this.logger.info(`found ${items.length} items supported.`);
        for (const item of items) {
            if (item instanceof Page && target instanceof Category) {
                item.categories = target.names;
                FileSystem.instance.write(item.resourceUri, await item.render());
            }
        }
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