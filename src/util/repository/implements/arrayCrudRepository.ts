import type { CrudRepository } from "../crudRepository";
import { RepositoryError } from "../repositoryError";

export abstract class ArrayCrudRepository<E> implements CrudRepository<E> {
    protected cachedEntities: E[] = [];

    abstract getId: (entity: E) => string;
    abstract copy: (entity: E) => E;

    count = () => {
        return this.cachedEntities.length;
    };

    delete = (entity: E) => {
        this.checkExists(entity);
        this.cachedEntities = this.cachedEntities.filter(cachedEntity => {
            return this.getId(cachedEntity) === this.getId(entity);
        });
    };

    deleteAll = (entities?: readonly E[] | undefined) => {
        if (entities === undefined) {
            this.cachedEntities = [];
            return;
        }
        entities.forEach(this.delete);
    };

    deleteAllById = (ids: readonly string[]) => {
        this.findAllById(ids).forEach(this.delete);
    };

    deleteById = (id: string) => {
        this.checkExistsById(id);
        this.delete(this.findById(id)!);
    };

    existsById = (id: string) => {
        return this.findById(id) !== undefined;
    };

    findAll = () => {
        return this.cachedEntities.map(this.copy);
    };

    findAllById = (ids: readonly string[]) => {
        return ids.map(this.findById).filter(this.isEntity);
    };

    findById = (id: string) => {
        const foundEntity = this.cachedEntities.find(entity => {
            return this.getId(entity) === id;
        });
        if (foundEntity === undefined) {
            return undefined;
        }
        return this.copy(foundEntity);
    };

    save = (entity: E) => {
        const foundIndex = this.cachedEntities.findIndex(cachedEntity => {
            return this.getId(cachedEntity) === this.getId(entity);
        });
        if (foundIndex === -1) {
            this.cachedEntities.push(this.copy(entity));
        } else {
            this.cachedEntities[foundIndex] = this.copy(entity);
        }
    };

    saveAll = (entities: readonly E[]) => {
        entities.forEach(this.save);
    };

    private isEntity(entity: E | undefined): entity is E {
        return entity !== undefined;
    }

    private checkExists = (entity: E) => {
        this.checkExistsById(this.getId(entity));
    };

    private checkExistsById = (id: string) => {
        if (!this.existsById(id)) {
            throw new RepositoryError.ItemNotFound();
        }
    };
}