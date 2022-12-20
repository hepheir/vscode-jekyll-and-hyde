import * as vscode from "vscode";
import { Repository } from "../models/repository/repository";

export interface RepositorySyncService<E, R extends Repository<E>> {
    getRepository: () => R;
    onDidLoad: vscode.Event<R>;
    isLoaded: () => boolean;
    load: () => Promise<void>;
    ensureLoaded: () => Promise<void>;
}