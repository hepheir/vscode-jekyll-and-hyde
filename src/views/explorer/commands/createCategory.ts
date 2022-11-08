import * as vscode from "vscode";
import Category from "../../../models/category";
import TreeView from "../TreeView";

export default async function createCategory(parent: Category) {
    const options: vscode.InputBoxOptions = {
        title: 'Create a new category',
        prompt: 'Enter the name of the category',
        validateInput: createInputValidator(parent),
    }
    const label = await vscode.window.showInputBox(options);
    if (label === undefined) {
        return;
    }
    let subcategory: Category | undefined = parent.findCategoryByLabel(label);
    if (subcategory === undefined) {
        subcategory = parent.createSubcategory(label);
    }
    TreeView.instance.treeDataProvider.changeTreeData(subcategory.parent);
    TreeView.instance.view.reveal(subcategory);
}


function createInputValidator(category: Category): (value: string) => vscode.InputBoxValidationMessage | undefined {
    return (value) => {
        if (category.findCategoryByLabel(value) === undefined) {
            return undefined;
        } else {
            return {
                message: 'Category already exists.',
                severity: vscode.InputBoxValidationSeverity.Warning,
            };
        }
    };
}
