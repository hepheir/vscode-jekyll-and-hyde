import { throws } from "assert";
import {
    Event,
    EventEmitter,
    ExtensionContext,
    TreeDataProvider,
    TreeItem,
    TreeView,
    window,
} from "vscode";

interface ViewConstructor {
	new (context: ExtensionContext): TreeViewBase;
}

const registrableViews: ViewConstructor[] = [];

export const registedViews: TreeViewBase[] = [];

export function view(): ClassDecorator {
    return (target: any) => {
        registrableViews.push(target);
    }
}

export function createViews(context: ExtensionContext) {
    registrableViews.map(c => new c(context)).forEach(v => {
        registedViews.push(v);
    });
}

export abstract class TreeViewBase implements TreeDataProvider<TreeItem> {
    protected _view: TreeView<any>;

    private _onDidChangeTreeData: EventEmitter<any> = new EventEmitter<any>();
	readonly onDidChangeTreeData: Event<any> = this._onDidChangeTreeData.event;

    constructor(public readonly id: string) {
        this._view = window.createTreeView(this.id, { treeDataProvider: this });
    }

    getTreeItem(element: TreeItem): TreeItem {
        return element;
    }

    async getChildren(element?: TreeItem): Promise<TreeItem[]> {
        if (element === undefined) {
            return this.getRoot();
        } else {
            return this.getChildrenOf(element);
        }
    }

    public refresh() {
        this._onDidChangeTreeData.fire(undefined);
    }

    abstract getRoot(): TreeItem[];

    abstract getChildrenOf(element: TreeItem): TreeItem[];
}
