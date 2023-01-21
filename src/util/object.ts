import * as vscode from 'vscode';

export interface Comparable<T> {
    compareTo(x: T): number;
}

export interface Hashable {
    hash(): string;
}

export interface Observable<T> {
    notify: () => void;
    subscribe: vscode.Event<T>;
}

export interface Copyable<T> {
    copy(): T;
}