import * as vscode from "vscode";
import { Command, CommandGroup } from "./base";
import CategoriesView from "../view/categories";
import { Category, CategoryRepository } from "../model/category";

class CategoryCommands extends CommandGroup {
    public static use() {
        new CategoryCommands().registerAll();
    }

    private constructor() {
        console.log("initializing category commands.");
        super('jekyll-n-hyde.command.category',
            new CreateCategoryCommand('create'),
        );
    }
}

class CreateCategoryCommand extends Command {
    private categoryRepository = CategoryRepository.instance;
    private categoriesView = CategoriesView.getInstance();

    dispose = async (category: Category | undefined) => {
        const name: string = await this.prompt();
        category = category ?? this.categoryRepository.findRoot();
        const subcategory = category.createSubcategory(name);
        if (!this.categoryRepository.existsById(subcategory.getId())) {
            this.categoryRepository.save(subcategory);
        }
        this.categoriesView.refresh();
        this.categoriesView.reveal(subcategory);
    }

    prompt = async () => {
        const options: vscode.InputBoxOptions = {
            title: 'Create a new category',
            prompt: 'Enter the name of category to create.',
        }
        const userInput = await vscode.window.showInputBox(options);
        if (userInput === undefined) {
            throw new Error("Aborted.");
        }
        return userInput!;
    }
}

export default CategoryCommands;