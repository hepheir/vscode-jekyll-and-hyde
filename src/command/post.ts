import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import { Command, CommandGroup } from "./base";
import { Category, CategoryRepository } from "../model/category";
import { Page } from "../model/page";
import CategoriesView from "../view/categories";

class PostCommands extends CommandGroup {
    public static use() {
        new PostCommands().registerAll();
    }

    private constructor() {
        console.log("initializing post commands.");
        super('jekyll-n-hyde.command.post',
            new CreatePostCommand('create'),
        );
    }
}

class CreatePostCommand extends Command {
    private categoryRepository = CategoryRepository.instance;
    private categoriesView = CategoriesView.getInstance();

    dispose = async (category: Category | undefined) => {
        const title: string = await this.prompt();
        category = category ?? this.categoryRepository.findRoot();
        const uri = this.generateUniqueUri(title);
        const page = new Page(uri, {
            title,
            categories: category.names,
        });
        page.write();
        this.categoriesView.refresh();
        this.categoriesView.reveal(page);
        vscode.window.showTextDocument(uri);
    }

    private prompt = async () => {
        const options: vscode.InputBoxOptions = {
            title: 'Create a new post',
            prompt: 'Enter the title of the post',
        }
        const userInput = await vscode.window.showInputBox(options);
        if (userInput === undefined) {
            throw new Error("Aborted.");
        }
        return userInput!;
    }

    private generateUniqueUri = (title: string) => {
        let uri: vscode.Uri = this.generateUri(title);
        for (let i = 0; fs.existsSync(uri.fsPath); i++) {
            uri = this.generateUri(this.addNumbering(title, i));
        }
        return uri;
    }

    private generateUri = (title: string) => {
        const workspaceFolder: string | undefined = vscode.workspace.workspaceFolders?.[0].uri.path;
        if (!workspaceFolder) {
            throw new Error();
        }
        const basename = this.generateBasename(title);
        return vscode.Uri.file(path.join(workspaceFolder!, '_posts', basename));
    }

    private generateBasename = (title: string) => {
        const date = new Date();
        const ext = '.md';
        const basename = [
            this.pad(date.getFullYear()),
            this.pad(date.getMonth()+1),
            this.pad(date.getDate()),
            this.escapeFilename(title)
        ].join('-');
        return basename + ext;
    }

    private pad = (x: number) => {
        return (x < 10) ? ('0'+x.toString()) : x.toString();
    }

    private escapeFilename = (value: string) => {
        return value.replace(/[^\w-\(\)]/g, '-').toLowerCase();
    }

    private addNumbering = (title: string, nth: number) => {
        return (nth == 0) ? title : title + ' (' + nth.toString() + ')';
    }
}

export default PostCommands;