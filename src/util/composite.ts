import type { Optional } from './optional';
import type { Repository, RepositoryItem } from './repository';

export interface Composite<E extends Composite<E>> extends RepositoryItem<E> {
    children: Repository<E>;
    getRoot: () => E;
    findParent: () => Optional<E>;
    findAncestors: () => E[];
}