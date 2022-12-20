import type { Repository } from "./repository";

export interface CompositeRepository<E> extends Repository<E> {
    findRoot: () => E;
    findParent: (entity: E) => E | undefined;
    findChildren: (entity: E) => E[];
}