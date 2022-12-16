import type { Repository } from "./repository";
import { RepositoryError } from "./repositoryError";
import type { RepositoryItem } from "./repositoryItem";

export class ArrayRepository<E extends RepositoryItem<E>> implements Repository<E> {
    protected elements: E[] = [];

    add(element: E): void {
        if (this.find(e => e.equals(element)) !== undefined) {
            throw new RepositoryError.ItemExists();
        }
        this.elements.push(element.copy());
        this.elements.sort((e1, e2) => e1.getId().localeCompare(e2.getId()));
    }

    list(): readonly E[] {
        return this.elements;
    }

    findAll(predicate: (element: E) => boolean): E[] {
        return this.elements
            .filter(predicate)
            .map(e => e.copy());
    }

    find(predicate: (element: E) => boolean): E | undefined {
        return this.elements.find(predicate)?.copy();
    }

    ensureFind(predicate: (element: E) => boolean): E {
        const foundItem = this.find(predicate);
        if (foundItem === undefined) {
            throw new RepositoryError.ItemNotFound();
        }
        return foundItem;
    }

    update(element: E): void {
        const foundIndex = this.elements.findIndex(e => e.equals(element));
        if (foundIndex === -1) {
            throw new RepositoryError.ItemNotFound();
        }
        this.elements[foundIndex] = element.copy();
    }

    remove(element: E): void {
        if (this.find(e => e.equals(element)) === undefined) {
            throw new RepositoryError.ItemNotFound();
        }
        this.elements = this.elements.filter(e => !e.equals(element));
    }
}