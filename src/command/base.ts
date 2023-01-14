import * as vscode from "vscode";

export abstract class Command {
    private _id: string;
    private group?: CommandGroup;

    constructor(
        id: string,
    ) {
        this._id = id;
    }

    abstract dispose(...args: any[]): any;

    get id() {
        return (this.group === undefined)
            ? this._id
            : `${this.group.id}.${this._id}`;
    }

    onAddedToGroup(group: CommandGroup) {
        this.group = group;
    }

    register() {
        vscode.commands.registerCommand(this.id, this.dispose, this);
        console.log(`command <${this.id}> was registered.`);
    }
}

export class CommandGroup {
    private readonly commands: Command[] = [];

    constructor(
        public readonly id: string,
        ...commands: readonly Command[]
    ) {
        console.log(`initializing command group with id "${id}".`);
        this.add(...commands);
    }

    add(...commands: readonly Command[]) {
        commands.forEach(this.addCommand);
        this.commands.push(...commands);
    }

    private addCommand = (command: Command) => {
        try {
            command.onAddedToGroup(this);
            console.log(`command <${command.id}> was added to command group <${this.id}>.`);
        } catch (e) {
            console.error(`failed to add command <${command.id}> to command group <${this.id}>.`);
        }
    }

    registerAll() {
        this.commands.forEach(c => c.register());
    }
}
