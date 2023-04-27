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

  static debug(message: string): void {
    if (LogLevel.debug >= Logger.level) {
      console.debug(`[debug:${timestamp()}] ${message}`);
    }
  }

  static info(message: string): void {
    if (LogLevel.info >= Logger.level) {
      console.info(`[info:${timestamp()}] ${message}`);
    }
  }

  static log(message: string): void {
    if (LogLevel.log >= Logger.level) {
      console.log(`[log:${timestamp()}] ${message}`);
    }
  }

  static warn(message: string): void {
    if (LogLevel.warn >= Logger.level) {
      console.warn(`[warn:${timestamp()}] ${message}`);
    }
  }

  static error(message: string | Error): void {
    if (LogLevel.error >= Logger.level) {
      console.error(`[error:${timestamp()}]`, message);
    }
  }
}