import * as vscode from "vscode";
import Page from "./page";

export default interface PageLoader {
    onDidLoad: vscode.Event<Page[]>;
    load(): void;
}