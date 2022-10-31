import * as vscode from "vscode";
import Page from "./page";

export default interface PageRepository {
    onDidLoad: vscode.Event<void | PageRepository | null | undefined>;
    load(): void;
    findAllCategories(): string[];
    findAllPagesByCategory(category: void | string | null | undefined): Page[];
}