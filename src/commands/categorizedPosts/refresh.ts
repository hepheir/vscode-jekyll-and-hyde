import { commands } from "vscode";
import { CategorizedPosts } from "../../views/categorizedPosts";


export const disposable = commands.registerCommand('categorizedPosts.refresh', () => {
    CategorizedPosts.treeDataProvider.refresh();
});
