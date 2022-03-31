import * as matter from "gray-matter";
import * as path from "path";
import * as vscode from "vscode";
import { FrontMatter, Page } from "jekyll";
import { CategorizedPosts, Entry } from '../../../views/categorizedPosts';
import { CategoriesParser } from "../../../parsers/categoriesParser";


export const disposable = vscode.commands.registerCommand('categorizedPosts.item.rename', async (entry: Entry) => {
    const { category, post } = entry;
    if (category) {
        await renameCategory(category);
    } else if (post) {
        await renameFile(post);
    }
});


async function renameFile(page: Page): Promise<void> {
    const { dir, base } = path.parse(page.path);

    const newBase = await vscode.window.showInputBox({
        title: 'Rename File',
        placeHolder: base,
        value: base,
    });
    if (!newBase) return;

    const oldUri = vscode.Uri.file(path.join(dir, base));
    const newUri = vscode.Uri.file(path.join(dir, newBase));

    const workspaceEdit = new vscode.WorkspaceEdit();

    workspaceEdit.renameFile(oldUri, newUri, {
        overwrite: false
    });

    await vscode.workspace.applyEdit(workspaceEdit);
}


async function renameCategory(category: string): Promise<void> {
    if (category === CategoriesParser.UNCATEGORIZED) return;

    const oldCategory = category;
    const newCategory = await vscode.window.showInputBox({
        title: 'Rename File',
        placeHolder: category,
        value: category,
    });
    if (!newCategory) return;

    const site = CategorizedPosts.treeDataProvider.site;
    const pages = site.categories[category];

    await Promise.all(pages.map(p => {
        const { categories } = p;
        const index = categories.findIndex(category => category == oldCategory);
        if (index == -1) {
            categories.push(newCategory);
        } else {
            categories[index] = newCategory;
        }
        const uri = vscode.Uri.file(p.path);
        return editFrontmatter(uri, { categories, category: undefined })
    }));

    await vscode.commands.executeCommand('categorizedPosts.refresh');
}


async function editFrontmatter(uri: vscode.Uri, data: FrontMatter): Promise<void> {
    const buffer = await vscode.workspace.fs.readFile(uri);
    const content = buffer.toString();
    const file = matter(content);
    const newData: { [key: string]: any} = {...file.data, ...data};
    Object.keys(newData).forEach((key: string) => {
        if (newData[key] === undefined) {
            delete newData[key];
        }
    });
    const newContent = matter.stringify(file.content, newData);
    const newBuffer = Buffer.from(newContent);
    await vscode.workspace.fs.writeFile(uri, newBuffer);
}
