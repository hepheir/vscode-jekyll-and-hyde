import { Heap } from "./array";
import type { Comparable, Copyable } from "./util";

class ItemExists extends Error {}

class ItemNotFound extends Error {}

const RepositoryError = {
    ItemExists,
    ItemNotFound,
}

interface Repository<E extends RepositoryItem<E>> {}

interface RepositoryItem<E> extends Copyable<E> {
    getId: () => string;
}

interface CompositeRepository<E extends RepositoryItem<E>> extends Repository<E> {
    findRoot: () => E;
    findParent: (entity: E) => E | undefined;
    findChildren: (entity: E) => E[];
}

interface CrudRepository<E extends RepositoryItem<E>> extends Repository<E> {
    count: () => number;
    delete: (entity: E) => void;
    deleteAll: (entities?: readonly E[] | undefined) => void;
    deleteAllById: (ids: readonly string[]) => void;
    deleteById: (id: string) => void;
    existsById: (id: string) => boolean;
    findAll: () => E[];
    findAllById: (ids: readonly string[]) => E[];
    findById: (id: string) => E | undefined;
    save: (entity: E) => void;
    saveAll: (entities: readonly E[]) => void;
    preSave: (entity: E) => void;
    postSave: (entity: E) => void;
}

class ArrayCrudRepository<E extends RepositoryItem<E>> implements CrudRepository<E> {
    protected cachedEntities: E[] = [];

    count = () => {
        return this.cachedEntities.length;
    }

    delete = (entity: E) => {
        this.checkExists(entity);
        this.cachedEntities = this.cachedEntities.filter(cachedEntity => {
            return entity.getId() === cachedEntity.getId();
        });
    }

    deleteAll = (entities?: readonly E[] | undefined) => {
        if (entities === undefined) {
            this.cachedEntities = [];
            return;
        }
        entities.forEach(this.delete);
    }

    deleteAllById = (ids: readonly string[]) => {
        this.findAllById(ids).forEach(this.delete);
    }

    deleteById = (id: string) => {
        this.checkExistsById(id);
        this.delete(this.findById(id)!);
    }

    existsById = (id: string) => {
        return this.findById(id) !== undefined;
    }

    findAll = () => {
        return this.cachedEntities.map(e => e.copy());
    }

    findAllById = (ids: readonly string[]) => {
        return ids.map(this.findById).filter(this.isEntity);
    }

    findById = (id: string) => {
        return this.cachedEntities.find(entity => {
            return entity.getId() === id;
        })?.copy();
    }

    save = (entity: E) => {
        this.preSave(entity);
        const foundIndex = this.cachedEntities.findIndex(e => {
            return e.getId() === entity.getId();
        });
        if (foundIndex === -1) {
            this.cachedEntities.push(entity.copy());
        } else {
            this.cachedEntities[foundIndex] = entity.copy();
        }
        this.postSave(entity);
    }

    saveAll = (entities: readonly E[]) => {
        entities.forEach(this.save);
    }

    preSave = (entity: E) => {};

    postSave = (entity: E) => {};

    private checkExists = (entity: E) => {
        this.checkExistsById(entity.getId());
    }

    private checkExistsById = (id: string) => {
        if (!this.existsById(id)) {
            throw new RepositoryError.ItemNotFound();
        }
    }

    private isEntity(entity: E | undefined): entity is E {
        return entity !== undefined;
    }
}

class HeapCrudRepository<E extends RepositoryItem<E> & Comparable<E>> extends ArrayCrudRepository<E> {
    protected cachedEntities: E[] = new Heap();

    deleteAll = (entities?: readonly E[] | undefined) => {
        if (entities === undefined) {
            this.cachedEntities = new Heap();
            return;
        }
        entities.forEach(this.delete);
    }
}

export {
    RepositoryError,
    Repository,
    RepositoryItem,
    CompositeRepository,
    CrudRepository,
    ArrayCrudRepository,
    HeapCrudRepository,
}