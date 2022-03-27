import {
    ExtensionContext,
    Uri,
    window
} from "vscode";
import { Commands } from "../constants";
import { command, Command } from "./base";


@command()
export class ShowTextDocumentCommand extends Command {
    constructor(context: ExtensionContext) {
        super(Commands.ShowTextDocument);
    }

    override execute(resourceUri: Uri) {
        window.showTextDocument(resourceUri);
    }
}
