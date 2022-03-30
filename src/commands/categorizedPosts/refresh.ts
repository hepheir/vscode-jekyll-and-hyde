import { commands } from "vscode";
import { CategorizedPosts } from "../../views/categorizedPosts";


commands.registerCommand('categorizedPosts.refresh', () => {
    CategorizedPosts.treeDataProvider.refresh();
});
