import type { CrudRepository } from "../crudRepository";
import type { RepositoryItem } from "../repositoryItem";
import { RepositoryError } from "../repositoryError";

export class ArrayCrudRepository<E extends RepositoryItem<E>> implements CrudRepository<E> {
    protected cachedEntities: E[] = [];

    count = () => {
        return this.cachedEntities.length;
    };

    delete = (entity: E) => {
        this.checkExists(entity);
        this.cachedEntities = this.cachedEntities.filter(cachedEntity => {
            return cachedEntity.getId() === entity.getId();
        });
    };

    deleteAll = (entities: readonly E[] | undefined) => {
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
        return this.cachedEntities.map(entity => {
            return entity.copy();
        });
    };

    findAllById = (ids: readonly string[]) => {
        return ids.map(this.findById).filter(this.isEntity);
    };

    findById = (id: string) => {
        return this.cachedEntities.find(entity => {
            return entity.getId() === id;
        })?.copy();
    };

    save = (entity: E) => {
        const foundIndex = this.cachedEntities.findIndex(cachedEntity => {
            return cachedEntity.getId() === entity.getId();
        });
        if (foundIndex === -1) {
            throw new RepositoryError.ItemNotFound();
        }
        this.cachedEntities[foundIndex] = entity.copy();
    };

    saveAll = (entities: readonly E[]) => {
        entities.forEach(this.save);
    };

    private isEntity(entity: E | undefined): entity is E {
        return entity !== undefined;
    }

    private checkExists = (entity: E) => {
        this.checkExistsById(entity.getId());
    };

    private checkExistsById = (id: string) => {
        if (!this.existsById(id)) {
            throw new RepositoryError.ItemNotFound();
        }
    };
}