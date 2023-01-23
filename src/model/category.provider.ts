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

    constructor() {
        this.logger.info(`initializing ${CategoryProvider.name}.`);
        this.pageRepository.forEach(this.coverMissingCategoriesOfPage);
        this.subscribePageRepository();
    }

    get onDidChangeTreeData() {
        return this.onDidChangeTreeDataEventEmiiter.event;
    }

    getTreeItem = async (element: Category | Page) => {
        this.logger.debug(`get tree item of element : ${element}.`);
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
            this.logger.info(`=> getting children of root instead.`);
            providerResult = this.getChildren(Category.getRoot());
        }
        return providerResult;
    }

    getParent = (element: Category | Page) => {
        this.logger.info(`getting parent of ${element}.`);
        const foundParent = (element instanceof Page)
            ? Optional.of(this.getCategoryOfPage(element))
            : element.findParent();
        foundParent.ifPresent(parent => {
            this.logger.info(`found parent of ${element}.`);
            this.logger.info(`=> parent: ${parent}.`);
        });
        foundParent.ifEmpty(() => {
            this.logger.info(`could not find parent of ${element}.`);
        });
        const parent = foundParent.orElse(undefined);
        if (parent === Category.getRoot()) {
            this.logger.info(`=> found parent is root, replacing it with undefined.`);
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
            args = this.removeDuplicatedItems(args);
            this.logger.info(`updating ${args.length} items.`);
            args.forEach(arg => this.logger.info(`... updating ${arg}`));
        }
        this.onDidChangeTreeDataEventEmiiter.fire(args);
    }

    private removeDuplicatedItems = (items: (Category | Page)[]) => {
        const map: { [id: string]: Category | Page} = {};
        items.forEach(item => {
            map[item.getItemId()] = item;
        })
        const reducedItems = Object.values(map);
        this.logger.info(`removed ${items.length - reducedItems.length} duplicated items.`);
        return reducedItems;
    }

    private subscribePageRepository = () => {
        this.logger.info(`subscribe ${this.pageRepository}.`);
        this.pageRepository.subscribe(this.onPageRepositoryDiff);
    }

    private onPageRepositoryDiff = (diff: RepositoryItemDiff<Page>) => {
        this.logger.info(`notified by ${PageRepository.name}. (${diff.savedItems.length} saved, ${diff.deletedItems.length} deleted)`);
        diff.savedItems.forEach(this.coverMissingCategoriesOfPage);
        this.logger.info(`updating entire tree view.`);
        this.update(undefined);
    }

    protected getCategoryOfPage(page: Page) {
        this.logger.info(`getting category of ${page}.`);
        return this._getCategoryOfPage(page);
    }

    private coverMissingCategoriesOfPage = (page: Page) => {
        this.logger.info(`covering missing categories of ${page}.`);
        this._getCategoryOfPage(page);
    }

    private _getCategoryOfPage(page: Page) {
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