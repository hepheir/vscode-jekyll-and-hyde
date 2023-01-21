import * as vscode from "vscode";
import * as post from "./command/post";
import * as category from "./command/category";
import { Logger } from "./util/logger";
import { refresh } from "./command/refresh";

const logger = new Logger('command');

export function use() {
    registerCommand('jekyll-n-hyde.command.post.create', post.create);
    registerCommand('jekyll-n-hyde.command.post.publish', post.publish);
    registerCommand('jekyll-n-hyde.command.post.unpublish', post.unpublish);
    registerCommand('jekyll-n-hyde.command.post.date-up-to-date', post.dateUpToDate);
    registerCommand('jekyll-n-hyde.command.post.delete', post.delete_);
    registerCommand('jekyll-n-hyde.command.category.create', category.create);
    registerCommand('jekyll-n-hyde.command.refresh', refresh);
}

function registerCommand(id: string, callback: any) {
    logger.info(`enable : ${id}`);
    vscode.commands.registerCommand(id, callback);
}