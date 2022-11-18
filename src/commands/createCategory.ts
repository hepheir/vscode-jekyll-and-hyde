import * as vscode from "vscode";
import Category from "../models/category";
import TreeView from "../views/explorer/TreeView";
import { raiseException } from "../exceptions";

export default async function createCategory(parent: Category) {
    try {
        checkValidParentCategory(parent);
        const label: string = await getUserInput(parent);
        const subcategory: Category = getSubcategory(parent, label);
        TreeView.instance.treeDataProvider.changeTreeData(subcategory.parent);
        TreeView.instance.view.reveal(subcategory);
    } catch (error) {
        console.warn(error);
    }
}

function checkValidParentCategory(category: Category) {
    if (category instanceof Category) return;
    raiseException();
}

async function getUserInput(parent: Category): Promise<string> {
    const options: vscode.InputBoxOptions = {
        title: 'Create a new category',
        prompt: 'Enter the name of the category',
        validateInput: (value) =>
            parent.findCategoryByLabel(value) instanceof Category ? {
                message: 'Category already exists.',
                severity: vscode.InputBoxValidationSeverity.Warning,
            } : undefined
    };
    const userInput = await vscode.window.showInputBox(options);
    if (userInput === undefined) raiseException();
    return userInput!;
}

function getSubcategory(parent: Category, label: string): Category {
    return parent.findCategoryByLabel(label) ?? parent.createSubcategory(label);
}