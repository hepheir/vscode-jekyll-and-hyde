import * as vscode from "vscode";

export class Logger {
    private static readonly SCOPE_SIZE: number | undefined = undefined;
    private static readonly CHANNEL_NAME = 'Jekyll N Hyde';
    private static readonly PREFIX_DEBUG = '[DEBUG]';
    private static readonly PREFIX_INFO = '[INFO]';
    private static readonly PREFIX_WARN = '[WARN]';
    private static readonly PREFIX_ERROR = '[ERROR]';
    private static readonly channel = vscode.window.createOutputChannel(Logger.CHANNEL_NAME);

    private readonly loggerName: string;
    private enabled = true;

    constructor(loggerName: string) {
        this.loggerName = loggerName;
    }

    disable = () => {
        this.info(`disabled [${this.loggerName}]`);
        this.enabled = false;
    }

    debug = (...args: readonly any[]) => {
        this.printFn(Logger.PREFIX_DEBUG, this.renderLoggerName(), ...args);
    }

    info = (...args: readonly any[]) => {
        this.printFn(Logger.PREFIX_INFO, this.renderLoggerName(), ...args);
    }

    warn = (...args: readonly any[]) => {
        this.printFn(Logger.PREFIX_WARN, this.renderLoggerName(), ...args);
    }

    error = (...args: readonly any[]) => {
        this.printFn(Logger.PREFIX_ERROR, this.renderLoggerName(), ...args);
    }

    private renderLoggerName(): string {
        return (Logger.SCOPE_SIZE === undefined)
            ? `["${this.loggerName}"]`
            : `["${this.renderFixedSize(this.loggerName, Logger.SCOPE_SIZE)}"]`;
    }

    private renderFixedSize(msg: string, size: number, ellipsis: string = '...'): string {
        return (msg.length > size)
            ? this.loggerName.slice(0, size - ellipsis.length) + ellipsis
            : this.loggerName.padEnd(size);
    }

    private printFn(...args: readonly any[]) {
        if (!this.enabled) {
            return;
        }
        Logger.channel.appendLine(this.stringifyArgs(...args).join(' '));
    }

    private stringifyArgs(...args: readonly any[]): string[] {
        return args.map(x => {
            if (typeof x == 'string') {
                return x;
            }
            return JSON.stringify(x);
        })
    }
}

export interface Logable {
    logger: Logger;
    toString: () => string;
}