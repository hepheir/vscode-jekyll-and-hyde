import * as vscode from "vscode";
import { Logger } from "./logger";

const logger = new Logger('util.io');

async function promptViaInputBox(options: vscode.InputBoxOptions | undefined = undefined) {
    const userInput = await vscode.window.showInputBox(options);
    if (userInput === undefined) {
        logger.error(`aborted user prompt : ${options?.title}`);
        throw new Error("Aborted.");
    }
    return userInput!;
}

export {
    promptViaInputBox,
}