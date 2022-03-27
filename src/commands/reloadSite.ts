import {
    commands,
    ExtensionContext,
    Uri,
    workspace
} from "vscode";
import { SiteParser } from "../parsers/siteParser";
import { CachedNodes } from "../views/nodes/cachedNodes";
import { command, Command } from "./base";


@command()
export default class ReloadSiteCommand extends Command {
    constructor(private readonly context: ExtensionContext) {
        super('reloadSite');
    }

    override execute() {
        const source = workspace.workspaceFolders && workspace.workspaceFolders.length > 0
            ? workspace.workspaceFolders[0].uri
            : undefined;

        if (!source) {
            return;
        }

        (async () => {
            const site = await SiteParser.from(source);
            CachedNodes.cache(this.context, site);
	        commands.executeCommand('updateViews');
        })();
    }
}
