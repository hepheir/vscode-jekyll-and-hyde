export class Heap<E> extends Array<E> {
    override push(...items: E[]): number {
        super.push(...items);
        this.sort();
        return this.length;
    }
}