import * as vscode from "vscode";
import { CategoriesParser } from "../../../parsers/categoriesParser";
import { Entry } from "../../../views/categorizedPosts";


export const disposable = vscode.commands.registerCommand('categorizedPosts.item.createViaCategory', async (entry: Entry) => {
    if (!entry.category) return;

    const { category } = entry;

    const data = {};
    const content = '';

    if (category != CategoriesParser.UNCATEGORIZED) {
        Object.assign(data, { categories: [category] });
    }

    vscode.commands.executeCommand('categorizedPosts.item.create', content, data);
});
