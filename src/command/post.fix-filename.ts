import * as path from "path";
import * as vscode from "vscode";
import { Page } from "../model/page";
import { FileSystem } from "../model/fs";
import { Logger } from "../util/logger";
import { addNumberToBasenameIfExists } from "../util/path";

const logger = new Logger('command.post.fix-filename');

export async function fixFilename(page: Page) {
    logger.info(`fix filename : ${page}`);
    const newUri = createPostUri(page);
    FileSystem.instance.write(newUri, await page.render());
    FileSystem.instance.delete(page.resourceUri);
}

function createPostUri(page: Page): vscode.Uri {
    const workspaceFolder = FileSystem.instance.workspaceFolder;
    const basename = Page.createBasename(page.title, new Date(page.date));
    const uri = vscode.Uri.file(path.join(workspaceFolder.uri.path, '_posts', basename));
    return addNumberToBasenameIfExists(uri);
}