import type { Comparable } from "../comparable";

export class Heap<E extends Comparable<E>> extends Array<E> {
    override push(...items: E[]): number {
        super.push(...items);
        this.sort();
        return this.length;
    }

    override sort = (compareFn?: ((a: E, b: E) => number) | undefined) => {
        if (compareFn === undefined) {
            compareFn = (a, b) => {
                return a.compareTo(b);
            };
        }
        super.sort(compareFn);
        return this;
    }
}