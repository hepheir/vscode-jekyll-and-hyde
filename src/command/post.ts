import * as vscode from "vscode";
import type { CategoryDTO } from "../models/categoryDTO";
import { PostFileService } from "../services/postFileService";

export class PostCommand {
    private readonly postService = PostFileService.instance;

    constructor() {
        const id = 'jekyll-n-hyde.command.post'
        vscode.commands.registerCommand(id+'.create', this.createPost, this);
    }

    createPost = async (category: CategoryDTO | undefined) => {
        try {
            const title = await this.promptPostTitle();
            this.postService.create(title, category?.names ?? []);
        } catch (error) {
            console.warn(error);
        }
    }

    promptPostTitle = async () => {
        const options: vscode.InputBoxOptions = {
            title: 'Create a new draft',
            prompt: 'Enter the title of the draft',
        }
        const userInput = await vscode.window.showInputBox(options);
        if (userInput === undefined) {
            throw new Error("No input");
        }
        return userInput!;
    }
}
