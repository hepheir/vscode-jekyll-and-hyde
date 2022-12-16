export interface RepositoryItem<E extends RepositoryItem<E>> {
    getId(): string;
    copy(): E;
    equals(e: E): boolean;
}