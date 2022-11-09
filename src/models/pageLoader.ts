import * as vscode from "vscode";
import Page from "./page";

export default interface PageLoader {
    onDidLoad: vscode.Event<Page[]>;
    load(): void;
    addSubscriber(subscriber: PageLoaderSubscriber): void;
}

export interface PageLoaderSubscriber {
    usePageLoader(pageLoader: PageLoader): void;
}