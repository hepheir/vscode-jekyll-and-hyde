import * as path from "path";
import * as vscode from "vscode";
import * as matter from "gray-matter";
import { Category } from "../model/category";
import { FileSystem } from "../model/fs";
import { Page } from "../model/page";
import { promptViaInputBox } from "../util/io";
import { addNumberToBasenameIfExists } from "../util/path";
import { Logger } from "../util/logger";
import { CategoriesView } from "../view/categories";

const logger = new Logger('command.post.create');

export async function create(category: Category | undefined) {
    category = category ?? Category.getRoot();
    logger.info(`create post under category : ${category}`);
    const title = await promptViaInputBox({
        title: 'Create a new post',
        prompt: 'Enter the title of the post',
    });
    const today = new Date();
    const uri = createPostUri(title, today);
    const post = new Page(uri, { title: title, categories: category?.names });
    post.setDate(today);
    FileSystem.instance.write(uri, post.render(true));
}

function createPostUri(title: string, date: Date): vscode.Uri {
    const workspaceFolder = FileSystem.instance.workspaceFolder;
    const basename = Page.createBasename(title, date);
    const uri = vscode.Uri.file(path.join(workspaceFolder.uri.path, '_posts', basename));
    return addNumberToBasenameIfExists(uri);
}