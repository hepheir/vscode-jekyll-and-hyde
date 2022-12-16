import { ArrayRepository } from "../arrayRepository";
import type { CategoryDTO } from "./categoryDTO";
import type { CategoryRepository } from "./categoryRepository";

export class ArrayCategoryRepository extends ArrayRepository<CategoryDTO> implements CategoryRepository {
    findByName(name: string): CategoryDTO | undefined {
        return this.find(category => category.name === name);
    }
}