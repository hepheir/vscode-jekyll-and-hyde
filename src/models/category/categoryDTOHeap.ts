import { Heap } from "../common/iterable/heap";
import { CategoryDTO } from "./categoryDTO";

export class CategoryDTOHeap extends Heap<CategoryDTO> {
    override sort = (compareFn?: ((a: CategoryDTO, b: CategoryDTO) => number) | undefined) => {
        if (compareFn === undefined) {
            compareFn = (a, b) => {
                return this.getCategoryId(a).localeCompare(this.getCategoryId(b));
            };
        }
        super.sort(compareFn);
        return this;
    }

    private getCategoryId = (entity: CategoryDTO) => {
        return entity.names.join('/');
    }
}