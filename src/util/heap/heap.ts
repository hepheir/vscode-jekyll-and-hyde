import type { HeapItem } from "./heapItem";

export class Heap<E extends HeapItem> extends Array<E> {
    override push(...items: E[]): number {
        super.push(...items);
        this.sort();
        return this.length;
    }

    override sort = (compareFn?: ((a: E, b: E) => number) | undefined) => {
        if (compareFn === undefined) {
            compareFn = (a, b) => {
                return a.getComparableKey().localeCompare(b.getComparableKey());
            };
        }
        super.sort(compareFn);
        return this;
    }
}