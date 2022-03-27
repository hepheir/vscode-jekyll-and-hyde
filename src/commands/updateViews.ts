import {
    ExtensionContext,
} from "vscode";
import { Commands } from "../constants";
import { registedViews } from "../views/base";
import { command, Command } from "./base";

@command()
export class UpdateViewsCommand extends Command {
    constructor(private readonly context: ExtensionContext) {
        super(Commands.UpdateViews);
    }

    override execute() {
        registedViews.forEach(v => v.refresh());
    }
}
