import * as vscode from "vscode";
import Page from "../../../models/page";
import PageTreeItem from "./PageTreeItem";

export default class PostTreeItem extends PageTreeItem {
    constructor(readonly page: Page) {
        super(page);
        this.contextValue = 'post';
    }
}