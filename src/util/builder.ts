export interface Builder<T> {
    build(): T;
    isBuildable(): boolean;
}