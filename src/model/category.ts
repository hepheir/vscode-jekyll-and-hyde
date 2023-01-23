import * as vscode from "vscode";
import type { Comparable, Copyable } from "../util/object";
import type { Page } from "./page";
import { PageRepository } from "./page.repository";
import { Logable, Logger } from "../util/logger";
import { AbstractComposite } from "../util/composite.implement";
import { Optional } from "../util/optional";
import { SortedArray } from "../util/array";

export class Category extends AbstractComposite<Category> implements Comparable<Category>, Copyable<Category>, Logable, vscode.TreeItem {
    public static readonly ROOT_NAME = '#ROOT';
    private static changes: Category[] = [];
    private static readonly root = new Category([]);

    public static popRecentlyChanged(): Category[] {
        const retval = Category.changes;
        Category.changes = [];
        return retval;
    }

    public static getRoot(): Category {
        return Category.root;
    }

    public static predictId(names: readonly string[]): string {
        if (names.length === 0) {
            return Category.ROOT_NAME;
        }
        return names.join('/');
    }

    public readonly contextValue = 'jekyll-n-hyde.model.category';
    public readonly collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
    public readonly iconPath = vscode.ThemeIcon.Folder;
    public logger = new Logger('model.category');
    public names: string[] = [];
    private readonly postRepository = PageRepository.instance;

    private constructor(names: readonly string[]) {
        super(new SortedArray());
        this.names = names.slice();
    }

    get label() {
        return (this.names.length === 0)
            ? Category.ROOT_NAME
            : this.names[this.names.length - 1];
    }

    get description() {
        return `(${this.countPosts(true)})`;
    }

    get id() {
        return Category.predictId(this.names);
    }

    getRoot = () => {
        return Category.root;
    }

    getItemId = () => {
        return Category.predictId(this.names);
    }

    copy = () => {
        this.logger.debug(`creating replica of ${this}.`);
        const replica = new Category(this.names);
        replica.setChildren(this.children);
        return replica;
    }

    compareTo(x: Category): number {
        return this.getItemId().localeCompare(x.getItemId());
    }

    createSubcategory = (name: string) => {
        this.logger.info(`creating subcategory "${name}" from ${this}.`);
        const createdCategory = new Category([...this.names, name]);
        this.children.save(createdCategory);
        this.logger.info(`successfully created ${createdCategory}.`);
        return createdCategory;
    }

    findSubcategory(name: string): Optional<Category> {
        const subcategoryId = Category.predictId([...this.names, name]);
        return this.children.findById(subcategoryId);
    }

    removeSubcategory(name: string) {
        this.logger.info(`remove subcategory ${name} from ${this}.`);
        const subcategory = this.findSubcategory(name);
        if (subcategory.isEmpty()) {
            this.logger.warn(`there is no such category with ${name}.`);
            return;
        }
        this.children.delete(subcategory.get());
        this.logger.info(`successfully removed ${subcategory}.`);
    }

    findAllPosts(recursive: boolean = false): Page[] {
        this.logger.info(`finding all posts of ${this}.`);
        return this._findAllPosts(recursive);
    }

    countPosts(recursive: boolean = false): number {
        return this._findAllPosts(recursive).length;
    }

    toString = () => {
        return `<Category "${this.names.join('/') || Category.ROOT_NAME}"> (${this.children.count()} categories & ${this.countPosts()} posts)`;
    }

    private _findAllPosts(recursive: boolean): Page[] {
        return recursive
            ? this.postRepository.filter(this.isChildPost)
            : this.postRepository.filter(this.isDirectChildPost);
    }

    private isDirectChildPost = (page: Page) => {
        return (this.names.length == page.categories.length) && this.isChildPost(page);
    }

    private isChildPost = (page: Page) => {
        return this.names.every((name, index) => page.categories[index] === name);
    }
}