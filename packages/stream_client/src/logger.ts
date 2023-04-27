export enum LogLevel {
  debug = 0,
  info = 1,
  log = 2,
  warn = 3,
  error = 4,
  none = 5
};

const timestamp = (): string => {
  return (performance.now() * 1000).toFixed(0);
};

export class Logger {
  private static level: LogLevel = LogLevel.debug;

  static setLevel(level: LogLevel): void {
    Logger.level = level;
  }

  static debug(message: string, ...others: any[]): void {
    if (LogLevel.debug >= Logger.level) {
      console.debug(`[debug:${timestamp()}]`, message, others);
    }
  }

  static info(message: string, ...others: any[]): void {
    if (LogLevel.info >= Logger.level) {
      console.info(`[info:${timestamp()}]`, message, others);
    }
  }

  static log(message: string, ...others: any[]): void {
    if (LogLevel.log >= Logger.level) {
      console.log(`[log:${timestamp()}]`, message, others);
    }
  }

  static warn(message: string, ...others: any[]): void {
    if (LogLevel.warn >= Logger.level) {
      console.warn(`[warn:${timestamp()}]`, message, others);
    }
  }

  static error(message: string | Error, ...others: any[]): void {
    if (LogLevel.error >= Logger.level) {
      console.error(`[error:${timestamp()}]`, message, others);
    }
  }
}