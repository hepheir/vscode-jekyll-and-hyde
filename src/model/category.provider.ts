import * as vscode from "vscode";
import type { RepositoryItemDiff } from "../util/repository";
import { Category } from "./category";
import { Logable, Logger } from "../util/logger";
import { Page } from "./page";
import { PageRepository } from "./page.repository";
import { Optional } from "../util/optional";

export class CategoryProvider implements Logable, vscode.TreeDataProvider<Category | Page> {
    protected readonly pageRepository = PageRepository.instance;
    protected readonly onDidChangeTreeDataEventEmiiter: vscode.EventEmitter<undefined | Category | Page | (Category | Page)[]> = new vscode.EventEmitter();
    public logger = new Logger('model.category.provider');
    private initialized = false;

    constructor() {
        this.logger.info(`initializing ${CategoryProvider.name}.`);
        this.pageRepository.forEach(this.coverMissingCategoriesOfPage);
        this.subscribePageRepository();
    }

    get onDidChangeTreeData() {
        return this.onDidChangeTreeDataEventEmiiter.event;
    }

    getTreeItem = async (element: Category | Page) => {
        this.logger.info(`get tree item of element : ${element}.`);
        return element;
    }

    getChildren = (element?: Category | Page | undefined) => {
        this.logger.info(`getting children of ${element}.`);
        let providerResult: (Category | Page)[];
        if (element instanceof Category) {
            providerResult = [...element.children.list(), ...element.findAllPosts()];
        } else if (element instanceof Page) {
            providerResult = [];
        } else {
            this.logger.info(`...getting children of root instead.`);
            providerResult = this.getChildren(Category.getRoot());
        }
        return providerResult;
    }

    getParent = (element: Category | Page) => {
        this.logger.info(`getting parent of ${element}.`);
        const foundParent = (element instanceof Page)
            ? Optional.of(this.getCategoryOfPage(element))
            : element.findParent();
        foundParent.ifPresent(parent => this.logger.info(`found parent of ${element}: ${parent}.`));
        foundParent.ifEmpty(() => this.logger.info(`could not find parent of ${element}.`));
        const parent = foundParent.orElse(undefined);
        if (parent === Category.getRoot()) {
            return undefined;
        }
        return parent;
    }

    update = (args: undefined | Category | Page | (Category | Page)[] = undefined) => {
        if (args === undefined) {
            this.logger.info(`updating root.`);
        } else if (args instanceof Category || args instanceof Page) {
            this.logger.info(`updating ${args}.`);
        } else {
            this.logger.info(`updating ${args.length} items.`);
        }
        this.onDidChangeTreeDataEventEmiiter.fire(args);
    }

    private subscribePageRepository = () => {
        this.logger.info(`subscribe ${this.pageRepository}.`);
        this.pageRepository.subscribe(this.onPageRepositoryDiff);
    }

    private onPageRepositoryDiff = (diff: RepositoryItemDiff<Page>) => {
        this.logger.info(`notified by ${PageRepository.name}. (${diff.savedItems.length} saved, ${diff.deletedItems.length} deleted)`);
        diff.savedItems.forEach(this.coverMissingCategoriesOfPage);
        if (!this.initialized) {
            this.logger.info(`updating entire tree view.`);
            this.onDidChangeTreeDataEventEmiiter.fire(undefined);
            this.initialized = true;
            return;
        }
        const updatedCategories: Category[] = [];
        diff.savedItems.forEach(page => updatedCategories.push(this.getParent(page)!));
        diff.deletedItems.forEach(page => updatedCategories.push(this.getParent(page)!));
        this.logger.info(`updating ${updatedCategories.length} categories.`);
        this.onDidChangeTreeDataEventEmiiter.fire(updatedCategories);
    }

    private coverMissingCategoriesOfPage = (page: Page) => {
        this.logger.info(`covering missing categories of ${page}.`);
        this.getCategoryOfPage(page);
    }

    private getCategoryOfPage(page: Page) {
        return this.getCategoryByNames(Category.getRoot(), page.categories.slice());
    }

    private getCategoryByNames(category: Category, names: string[]): Category {
        const name = names.shift();
        if (name === undefined) {
            return category;
        }
        const subcategory = category.findSubcategory(name).orElseGet(() => category.createSubcategory(name));
        return this.getCategoryByNames(subcategory, names);
    }
}