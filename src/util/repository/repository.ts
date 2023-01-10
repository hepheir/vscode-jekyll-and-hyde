export interface Repository<E> {
    getId: (entity: E) => string;
    copy: (entity: E) => E;
}