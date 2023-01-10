import * as vscode from "vscode";
import type { Repository } from "../util/repository/repository";

export interface RepositorySyncService<E, R extends Repository<E>> {
    getRepository: () => R;
    onDidLoad: vscode.Event<R>;
    isLoaded: () => boolean;
    load: () => Promise<void>;
    ensureLoaded: () => Promise<void>;
}