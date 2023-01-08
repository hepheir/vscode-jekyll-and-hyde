import { Heap } from "../../util/heap/heap";
import { CategoryDTO } from "./categoryDTO";

export class CategoryDTOHeap extends Heap<CategoryDTO> {
    override getComparableKey = (category: CategoryDTO) => {
        return category.names.join('/');
    }
}