import type { Repository } from "../../common/repository";
import type { CategoryDTO } from "./categoryDTO";

export interface CategoryRepository extends Repository<CategoryDTO> {
    findByName(name: string): CategoryDTO | undefined;
}
