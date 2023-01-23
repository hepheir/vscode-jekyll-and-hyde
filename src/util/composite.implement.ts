import type { Composite } from './composite';
import type { Copyable } from './object';
import type { Repository } from './repository';
import { Logable, Logger } from './logger';
import { Optional } from './optional';
import { ArrayRepository } from './repository.implement';

export abstract class AbstractComposite<E extends Composite<E> & Copyable<E>> implements Composite<E>, Logable {
    public logger = new Logger('util.repository.array-repository');
    private _children: Repository<E>;

    constructor(itemContainer: E[] = []) {
        this._children = new ArrayRepository(itemContainer);
    }

    get children() {
        return this._children;
    }

    findAncestors = () => {
        this.logger.debug(`finding ancestors of ${this}`);
        const ancestors: E[] = [];
        this.findAncestorsDFS(this.getRoot(), ancestors);
        this.logger.debug(`found ${ancestors.length} ancestors of ${this}.`);
        return ancestors;
    }

    findParent = () => {
        this.logger.debug(`finding parent of ${this}`);
        return Optional.ofNullable(this.findAncestors().pop());
    }

    abstract getRoot: () => E;
    abstract getItemId: () => string;
    abstract copy: () => E;

    protected setChildren = (children: Repository<E>) => {
        this._children = children;
    }

    private findAncestorsDFS = (current: E, ancestors: E[]) => {
        if (current.getItemId() == this.getItemId()) {
            return true;
        }
        ancestors.push(current);
        for (const child of current.children.list()) {
            if (this.findAncestorsDFS(child, ancestors)) {
                return true;
            }
        }
        ancestors.pop();
        return false;
    }
}