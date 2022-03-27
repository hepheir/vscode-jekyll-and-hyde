import {
    ExtensionContext,
} from "vscode";
import { registedViews } from "../views/base";
import { command, Command } from "./base";

@command()
export default class UpdateViewsCommand extends Command {
    constructor(private readonly context: ExtensionContext) {
        super('updateViews');
    }

    override execute() {
        registedViews.forEach(v => v.refresh());
    }
}
