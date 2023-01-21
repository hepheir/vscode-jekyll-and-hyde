import * as vscode from "vscode";
import type { Observable } from "./object";
import type { Repository, RepositoryItem, RepositoryItemDiff } from "./repository";
import { Logable, Logger } from "./logger";
import { Optional } from "./optional";

export abstract class AbstractRepository<E extends RepositoryItem<E>> implements Repository<E> {
    protected logger = new Logger('util.repository.abstract-repository');

    count = () => {
        return this.getAll().length;
    }

    clear = () => {
        this.logger.info('clearing repository.');
        this.getAll().forEach(this.deleteOne);
        this.logger.info('repository cleared.');
    }

    delete = (...entities: readonly E[]) => {
        this.logger.info(`delete ${entities.length} entities.`);
        entities.forEach(this.deleteOne);
        this.logger.info(`deleted ${entities.length} entities. ${this.getAll().length} entities left.`);
    }

    find = (predicate: (entity: E) => boolean) => {
        return Optional.ofNullable(this.getAll().find(predicate));
    }

    findById = (id: string) => {
        return this.find(this.idPredicateFactory(id));
    }

    filter = (predicate: (entity: E) => boolean) => {
        return this.getAll().filter(predicate);
    }

    forEach = (callbackfn: (entity: E) => void) => {
        this.getAll().forEach(callbackfn);
    }

    list = () => {
        return this.getAll().slice();
    }

    save = (...entities: readonly E[]) => {
        this.logger.info(`save ${entities.length} entities.`);
        entities.forEach(this.saveOne);
        this.logger.info(`saved ${entities.length} entities. ${this.getAll().length} entities left.`);
    }

    protected abstract getAll: () => readonly E[];
    protected abstract deleteOne: (e: E) => void;
    protected abstract saveOne: (e: E) => void;

    protected idPredicateFactory = (id: string) => {
        return (e: E) => e.getItemId() === id;
    }
}

export class ArrayRepository<E extends RepositoryItem<E>> extends AbstractRepository<E> {
    protected logger = new Logger('util.repository.array-repository');
    protected readonly repositoryItems: E[];
    protected readonly onDidSaveEventEmitter = new vscode.EventEmitter<E>();
    protected readonly onDidDeleteEventEmitter = new vscode.EventEmitter<E>();
    public readonly onDidSave = this.onDidSaveEventEmitter.event;
    public readonly onDidDelete = this.onDidDeleteEventEmitter.event;

    constructor(itemContainer: E[] = []) {
        super();
        this.repositoryItems = itemContainer;
    }

    protected override getAll = () => {
        return this.repositoryItems;
    }

    protected override saveOne = (e: E) => {
        const index = this.findIndexOfEntity(e);
        if (index < 0) {
            this.repositoryItems.push(e);
        } else {
            this.repositoryItems.splice(index, 1, e);
        }
        this.onDidSaveEventEmitter.fire(e);
    }

    protected override deleteOne = (e: E) => {
        const index = this.findIndexOfEntity(e);
        this.repositoryItems.splice(index, 1);
        this.onDidDeleteEventEmitter.fire(e);
    }

    private findIndexOfEntity = (e: E) => {
        return this.repositoryItems.findIndex(this.entityPredicateFactory(e));
    }

    private entityPredicateFactory = (e: E) => {
        return this.idPredicateFactory(e.getItemId());
    }
}

export class ObservableArrayRepository<E extends RepositoryItem<E>> extends ArrayRepository<E> implements Observable<RepositoryItemDiff<E>>, Logable {
    public logger = new Logger('util.repository.observable-array-repository');
    protected readonly repositoryItemDiffEventEmitter = new vscode.EventEmitter<RepositoryItemDiff<E>>();
    protected savedItems: E[] = [];
    protected deletedItems: E[] = [];

    constructor() {
        super();
        this.onDidSave(e => this.savedItems.push(e));
        this.onDidDelete(e => this.deletedItems.push(e));
    }

    get subscribe() {
        return this.repositoryItemDiffEventEmitter.event;
    }

    notify = () => {
        this.logger.info(`notify subscribers. ${this.savedItems.length + this.deletedItems.length} items changed.`);
        this.repositoryItemDiffEventEmitter.fire({
            savedItems: this.savedItems.slice(),
            deletedItems: this.deletedItems.slice(),
        });
        this.savedItems = [];
        this.deletedItems = [];
        this.logger.info('successfully notified.');
    }
}