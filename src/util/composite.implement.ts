import type { Composite } from './composite';
import { Logable, Logger } from './logger';
import { Optional } from './optional';
import { ArrayRepository } from './repository.implement';

export abstract class AbstractComposite<E extends Composite<E>> implements Composite<E>, Logable {
    public readonly children;
    public logger = new Logger('util.repository.array-repository');

    constructor(itemContainer: E[] = []) {
        this.children = new ArrayRepository(itemContainer);
    }

    findAncestors = () => {
        this.logger.info(`finding ancestors of ${this}`);
        const ancestors: E[] = [];
        this.findAncestorsDFS(this.getRoot(), ancestors);
        this.logger.info(`found ${ancestors.length} ancestors of ${this}.`);
        return ancestors;
    }

    findParent = () => {
        this.logger.info(`finding parent of ${this}`);
        return Optional.ofNullable(this.findAncestors().pop());
    }

    abstract getRoot: () => E;

    abstract getItemId: () => string;

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