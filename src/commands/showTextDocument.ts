import {
    ExtensionContext,
    Uri,
    window
} from "vscode";
import { command, Command } from "./base";


@command()
export default class ShowTextDocumentCommand extends Command {
    constructor(context: ExtensionContext) {
        super('showTextDocument');
    }

    override execute(resourceUri: Uri) {
        window.showTextDocument(resourceUri);
    }
}
