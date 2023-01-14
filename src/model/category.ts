import type { Comparable } from "../util/util";
import {
    CompositeRepository,
    CrudRepository,
    RepositoryError,
    RepositoryItem,
    SortedArrayCrudRepository,
} from "../util/repository";
import { Page, PageRepository } from "./page";

class Category implements RepositoryItem<Category>, Comparable<Category> {
    public names: string[] = [];

    private categoryRepository = CategoryRepository.instance;
    private pageRepository = PageRepository.instance;

    get categories(): Category[] {
        return this.categoryRepository.findChildren(this);
    }

    get posts(): Page[] {
        return this.pageRepository
            .findAll()
            .filter(post => {
                return this.names.join('/') === post.categories.join('/');
            });
    }

    constructor(names: readonly string[]) {
        this.names = names.slice();
    }

    getDisplayName(): string {
        if (this.names.length === 0) {
            return '';
        }
        return this.names[this.names.length-1];
    }

    count(): number {
        return this.pageRepository
            .findAll()
            .filter(post => {
                if (post.categories.length < this.names.length) {
                    return false;
                }
                return this.names.join('/') === post.categories.slice(0, this.names.length).join('/');
            })
            .length;
    }

    createSubcategory(name: string): Category {
        return new Category([...this.names, name]);
    }

    getId(): string {
        return this.names.join('/');
    }

    copy(): Category {
        return new Category(this.names);
    }

    compareTo(x: Category): number {
        return this.getId().localeCompare(x.getId());
    }
}

class CategoryRepository extends SortedArrayCrudRepository<Category> implements CrudRepository<Category>, CompositeRepository<Category> {
    public static readonly instance = new CategoryRepository();

    private pageRepository = PageRepository.instance;

    private constructor() {
        console.log(`initializing category repository.`);
        super();
        console.log(`creating root category.`);
        this.save(new Category([]));

        console.log(`overriding page repository behavior.`);
        this.pageRepository.postSave = (post) => {
            this.save(new Category(post.categories ?? []));
        }
    }

    findRoot = () => {
        return this.findOrThrowByNames([]);
    }

    findParent = (entity: Category) => {
        return this.cachedEntities.find(x => {
            return this.isChild(entity, x);
        })?.copy();
    }

    findChildren = (entity: Category) => {
        return this.cachedEntities
            .filter(x => this.isChild(x, entity))
            .map(x => x.copy());
    }

    private isChild = (child: Category, parent: Category) => {
        if (child.names.length === 0) {
            return false;
        }
        return child.names.slice(0, -1).join('/') === parent.names.join('/');
    }

    preSave = (entity: Category) => {
        if (this.shouldHaveParent(entity) && this.findParent(entity) === undefined) {
            this.createParent(entity);
        }
    }

    private createParent = (entity: Category) => {
        const parent = new Category(this.getParentNames(entity));
        this.save(parent);
    }

    postSave = (entity: Category) => {
        if (this.shouldHaveParent(entity)) {
            this.updateParent(entity);
        }
    }

    private updateParent = (entity: Category) => {
        const parent = this.findParent(entity);
        if (parent === undefined) {
            return;
        }
        parent.categories.push(entity);
        this.save(parent);
    }

    private findOrThrowByNames = (names: readonly string[]) => {
        const foundCategory = this.findByNames(names);
        if (foundCategory === undefined) {
            throw new RepositoryError.ItemNotFound();
        }
        return foundCategory;
    }

    private findByNames = (names: readonly string[]) => {
        return this.findById(new Category(names).getId());
    }

    private getParentNames = (entity: Category) => {
        if (!this.shouldHaveParent(entity)) {
            throw new RepositoryError.ItemNotFound();
        }
        return entity.names.slice(0, entity.names.length - 1);
    }

    private shouldHaveParent = (entity: Category) => {
        return entity.names.length > 0;
    }
}

export {
    Category,
    CategoryRepository,
};