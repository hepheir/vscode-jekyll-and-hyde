import type { CrudRepository } from "../repository/crudRepository";
import { ArrayCrudRepository } from "../repository/implements/arrayCrudRepository";
import type { CategoryDTO } from "./categoryDTO";

export class CategoryRepository extends ArrayCrudRepository<CategoryDTO> implements CrudRepository<CategoryDTO> {
    override getId = (entity: CategoryDTO) => {
        return entity.names.join('/');
    };

    override copy = (entity: CategoryDTO) => {
        const newCategory: CategoryDTO = {
            names: entity.names.slice(),
            posts: entity.posts.slice(),
            categories: entity.categories.slice(),
        };
        return newCategory;
    };
}