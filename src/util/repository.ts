import type { Optional } from './optional';

export interface RepositoryItemDiff<E extends RepositoryItem<E>> {
    savedItems: E[];
    deletedItems: E[];
}

export interface RepositoryItem<E extends RepositoryItem<E>> {
    getItemId: () => string;
}

export interface Repository<E extends RepositoryItem<E>> {
    count: () => number;
    clear: () => void;
    delete: (...entities: readonly E[]) => void;
    find: (predicate: (entity: E) => boolean) => Optional<E>;
    findById: (id: string) => Optional<E>;
    filter: (predicate: (entity: E) => boolean) => E[];
    forEach: (callbackfn: (entity: E) => void) => void;
    list: () => E[];
    save: (...entities: readonly E[]) => void;
}