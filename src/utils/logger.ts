import * as vscode from 'vscode';

class Logger {
  private channel: vscode.OutputChannel;
  private static _instance: Logger | undefined;
  private static readonly LEVEL_TAGS: Record<'INFO' | 'WARN' | 'ERROR' | 'DEBUG', string> = {
    INFO: '[INFO]',
    WARN: '[WARN]',
    ERROR: '[ERROR]',
    DEBUG: '[DEBUG]'
  };

  private constructor() {
    this.channel = vscode.window.createOutputChannel('Claudex', 'claudex-log');
  }

  static get instance(): Logger {
    if (!this._instance) {
      this._instance = new Logger();
    }
    return this._instance;
  }

  private stringify(arg: unknown): string {
    if (arg instanceof Error) {
      return arg.stack || arg.message;
    }
    if (typeof arg === 'string') {
      return arg;
    }
    try {
      return JSON.stringify(arg);
    } catch {
      return String(arg);
    }
  }

  private line(level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG', parts: unknown[]): string {
    const timestamp = new Date().toISOString();
    const label = Logger.LEVEL_TAGS[level] ?? `[${level}]`;
    const message = parts.map((p) => this.stringify(p)).join(' ');
    const separator = message ? ' ' : '';
    return `${timestamp} ${label}${separator}${message}`;
  }

  info(...parts: unknown[]): void {
    this.channel.appendLine(this.line('INFO', parts));
  }

  warn(...parts: unknown[]): void {
    this.channel.appendLine(this.line('WARN', parts));
  }

  error(...parts: unknown[]): void {
    this.channel.appendLine(this.line('ERROR', parts));
  }

  debug(...parts: unknown[]): void {
    this.channel.appendLine(this.line('DEBUG', parts));
  }

  show(preserveFocus = true): void {
    this.channel.show(preserveFocus);
  }

}

export const logger = Logger.instance;
