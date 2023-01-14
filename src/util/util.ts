interface Comparable<T> {
    compareTo(x: T): number;
}

interface Copyable<T> {
    copy(): T;
}

interface Hashable {
    hash(): string;
}

export {
    Comparable,
    Copyable,
    Hashable,
};