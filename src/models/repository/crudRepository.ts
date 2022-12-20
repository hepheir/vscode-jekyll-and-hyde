import type { Repository } from "./repository";

export interface CrudRepository<E> extends Repository<E> {
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
}