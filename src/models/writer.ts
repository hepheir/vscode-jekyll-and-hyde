export interface Writer<T> {
    write(element: T): void;
}