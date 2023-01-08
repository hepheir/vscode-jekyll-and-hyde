export abstract class Heap<E> extends Array<E> {
    override push(...items: E[]): number {
        super.push(...items);
        this.sort();
        return this.length;
    }

    override sort = (compareFn?: ((a: E, b: E) => number) | undefined) => {
        if (compareFn === undefined) {
            compareFn = (a, b) => {
                return this.getComparableKey(a).localeCompare(this.getComparableKey(b));
            };
        }
        super.sort(compareFn);
        return this;
    }

    abstract getComparableKey(elment: E): string;
}