import type { RepositoryItem } from "./repositoryItem";
import { RepositoryItemPredicate } from "./repositoryItemPredicate";

export interface Repository<E extends RepositoryItem<E>> {
    add(element: E): void;
    list(): readonly E[];
    findAll(predicate: RepositoryItemPredicate<E>): E[];
    find(predicate: RepositoryItemPredicate<E>): E | undefined;
    ensureFind(predicate: RepositoryItemPredicate<E>): E;
    update(element: E): void;
    remove(target: E): void;
}