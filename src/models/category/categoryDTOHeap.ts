import { Heap } from "../common/iterable/heap";
import { CategoryDTO } from "./categoryDTO";

export class CategoryDTOHeap extends Heap<CategoryDTO> {
    override getComparableKey = (category: CategoryDTO) => {
        return category.names.join('/');
    }
}