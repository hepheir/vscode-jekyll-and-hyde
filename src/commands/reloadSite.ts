import {
    ExtensionContext,
    workspace
} from "vscode";
import { JekyllSite } from "../jekyllSite";
import { CachedNodes } from "../views/nodes/cachedNodes";
import { command, Command } from "./base";


@command()
export default class ReloadSiteCommand extends Command {
    constructor(private readonly context: ExtensionContext) {
        super('reloadSite');
    }

    override execute() {
        const source = workspace.workspaceFolders && workspace.workspaceFolders.length > 0
            ? workspace.workspaceFolders[0].uri.fsPath
            : undefined;

        if (!source) {
            return;
        }

        CachedNodes.cache(this.context, new JekyllSite(source));
    }
}
