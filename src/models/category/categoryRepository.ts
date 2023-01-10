import { CompositeRepository } from "../../util/repository/compositeRepository";
import type { CrudRepository } from "../../util/repository/crudRepository";
import { ArrayCrudRepository } from "../../util/repository/implements/arrayCrudRepository";
import { RepositoryError } from "../../util/repository/repositoryError";
import type { CategoryDTO } from "./categoryDTO";
import { CategoryDTOBuilder } from "./categoryDTOBuilder";

export class CategoryRepository
    extends ArrayCrudRepository<CategoryDTO>
    implements CrudRepository<CategoryDTO>, CompositeRepository<CategoryDTO>
{
    public static readonly instance: CategoryRepository = new CategoryRepository();

    private constructor() {
        super();
        const root: CategoryDTO = new CategoryDTOBuilder().build();
        this.save(root);
    }

    findRoot = () => {
        return this.findOrThrowByNames([]);
    }

    findParent = (entity: CategoryDTO) => {
        const parentNames = this.getParentNames(entity);
        return this.findByNames(parentNames);
    }

    findChildren = (entity: CategoryDTO) => {
        return entity.categories.slice();
    }

    getId = (entity: CategoryDTO) => {
        return entity.names.join('/');
    }

    copy = (entity: CategoryDTO) => {
        return new CategoryDTOBuilder()
            .setNames(entity.names)
            .setPosts(entity.posts)
            .setCategories(entity.categories)
            .build();
    }

    save = (entity: CategoryDTO) => {
        this.saveSuper(entity); // equivalent to `super.save(entity);`
        this.saveParent(entity);
    }

    /**
     * Indeed to V8's bug about `super` keyword, this method will replace `super.save()`
     *
     * https://stackoverflow.com/questions/32943776/using-super-within-an-arrow-function-within-an-arrow-function-within-a-method
     * */
    private saveSuper = (entity: CategoryDTO) => {
        const foundIndex = this.cachedEntities.findIndex(cachedEntity => {
            return this.getId(cachedEntity) === this.getId(entity);
        });
        if (foundIndex === -1) {
            this.cachedEntities.push(this.copy(entity));
        } else {
            this.cachedEntities[foundIndex] = this.copy(entity);
        }
    }

    private saveParent = (entity: CategoryDTO) => {
        if (!this.hasParent(entity)) {
            return;
        }
        const parentNames = this.getParentNames(entity);
        const parentCategory = this.findOrCreateByNames(parentNames);
        const foundIndex = parentCategory.categories.findIndex(subcategory => {
            return this.getId(subcategory) === this.getId(entity);
        });
        if (foundIndex === -1) {
            parentCategory.categories.push(this.copy(entity));
        } else {
            parentCategory.categories[foundIndex] = this.copy(entity);
        }
        this.save(parentCategory);
    }

    private getParentNames = (entity: CategoryDTO) => {
        if (!this.hasParent(entity)) {
            throw new RepositoryError.ItemNotFound();
        }
        return entity.names.slice(0, entity.names.length-1);
    }

    private hasParent = (entity: CategoryDTO) => {
        return entity.names.length > 0;
    }

    private findOrCreateByNames = (names: readonly string[]) => {
        return this.findByNames(names) ?? this.createByNames(names);
    }

    private findOrThrowByNames = (names: readonly string[]) => {
        const foundCategory = this.findByNames(names);
        if (foundCategory === undefined) {
            throw new RepositoryError.ItemNotFound();
        }
        return foundCategory;
    }

    private checkExistsByNames = (names: readonly string[]) => {
        if (!this.existsByNames(names)) {
            throw new RepositoryError.ItemNotFound();
        }
    }

    private checkNotExistsByNames = (names: readonly string[]) => {
        if (this.existsByNames(names)) {
            throw new RepositoryError.ItemExists();
        }
    }

    private existsByNames = (names: readonly string[]) => {
        return this.findByNames(names) !== undefined;
    }

    private findByNames = (names: readonly string[]) => {
        const tempCategory = new CategoryDTOBuilder()
            .setNames(names)
            .build();
        const id = this.getId(tempCategory);
        return this.findById(id);
    }

    private createByNames = (names: readonly string[]) => {
        const newCategory = new CategoryDTOBuilder()
            .setNames(names)
            .build();
        this.save(newCategory);
        return newCategory;
    }
}