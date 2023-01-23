import * as vscode from "vscode";

export enum LoggerLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3,
    NONE = 4,
}

export class Logger {
    private static readonly SCOPE_SIZE: number | undefined = undefined;
    private static readonly CHANNEL_NAME = 'Jekyll N Hyde';
    private static readonly PREFIX_DEBUG = '[DEBUG]';
    private static readonly PREFIX_INFO = '[INFO]';
    private static readonly PREFIX_WARN = '[WARN]';
    private static readonly PREFIX_ERROR = '[ERROR]';
    private static readonly channel = vscode.window.createOutputChannel(Logger.CHANNEL_NAME);

    public loggerLevel = LoggerLevel.INFO;
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
        if (this.loggerLevel > LoggerLevel.DEBUG) {
            return;
        }
        this.printFn(Logger.PREFIX_DEBUG, this.renderTimeStamp(), this.renderLoggerName(), ...args);
    }

    info = (...args: readonly any[]) => {
        if (this.loggerLevel > LoggerLevel.INFO) {
            return;
        }
        this.printFn(Logger.PREFIX_INFO, this.renderTimeStamp(), this.renderLoggerName(), ...args);
    }

    warn = (...args: readonly any[]) => {
        if (this.loggerLevel > LoggerLevel.WARN) {
            return;
        }
        this.printFn(Logger.PREFIX_WARN, this.renderTimeStamp(), this.renderLoggerName(), ...args);
    }

    error = (...args: readonly any[]) => {
        if (this.loggerLevel > LoggerLevel.ERROR) {
            return;
        }
        this.printFn(Logger.PREFIX_ERROR, this.renderTimeStamp(), this.renderLoggerName(), ...args);
    }

    private renderTimeStamp(): string {
        return `[${new Date().toLocaleTimeString()}]`;
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