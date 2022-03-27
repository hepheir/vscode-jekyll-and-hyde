import {
    commands,
    Disposable,
    ExtensionContext
} from "vscode";

interface CommandConstructor {
	new (context: ExtensionContext): Command;
}

const registrableCommands: CommandConstructor[] = [];

export function command(): ClassDecorator {
    return (target: any) => {
        registrableCommands.push(target);
    }
}

export function registerCommands(context: ExtensionContext): Disposable[] {
	return registrableCommands.map(c => new c(context));
}

export abstract class Command implements Disposable {
    private readonly _disposable: Disposable;

    constructor(command: string) {
        this._disposable = commands.registerCommand(
            command,
            (...args: any[]) => this.execute(...args),
            this
        );
    }

    dispose() {
        this._disposable.dispose();
    }

    abstract execute(...args: any[]): any;
}
