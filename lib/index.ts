import process from 'process';
import { createLogger, format, transports, Logger } from 'winston';
import 'winston-daily-rotate-file';
import path from 'path';
import { sanitizeStr } from '@utils/sanitizers';
import { ConsoleConfig, FileConfig, InitialConfig, LogLevel } from '@types';

const { combine, timestamp, label, printf } = format;

const myFormat = printf(
  info =>
    `${info.timestamp} [${info.label.toString().padStart(5, ' ')}] ${info.level}: ${info.message}`
);

/**
 *
 */
class LogService {
  private loggers: Logger[];
  private blackListParams: string[];
  private globalConfig: InitialConfig;

  /**
   *
   * @param _blackListParams A list of keys which value should be masked on the logs
   */
  constructor(_blackListParams?: string[]) {
    this.loggers = [];
    this.blackListParams = _blackListParams ?? [];
  }

  getBlackListParams() {
    return this.blackListParams;
  }

  setBlackListParams(_blackListParams: string[]) {
    this.blackListParams = _blackListParams;
  }

  addToBlackList(newBlackListParam: string[]) {
    this.blackListParams.push(...newBlackListParam);
  }

  removeFromBlackList(_blackListParam: string) {
    this.blackListParams = this.blackListParams.filter(param => param !== _blackListParam);
  }

  init(config: InitialConfig) {
    this.globalConfig = config;
    this.addFileLoggers(config.file);
    this.addConsoleLogger(config.console);
  }

  private addConsoleLogger(consoleConfig: ConsoleConfig) {
    if (!consoleConfig?.silent) {
      const consoleLogger = createLogger({
        level: consoleConfig.logLevel ?? LogLevel.debug,
        format: combine(label({ label: process.pid.toString() }), timestamp(), myFormat),
        transports: [new transports.Console()],
        silent: consoleConfig.silent,
      });
      this.loggers.push(consoleLogger);
    }
  }

  private addFileLoggers(fileConfig: FileConfig) {
    if (fileConfig && !fileConfig.silent) {
      const myJSONF = format((info, opts) => ({
        ...info,
        pid: process.pid,
        hostname: this.globalConfig.hostname,
        application: this.globalConfig.appName,
        version: this.globalConfig.version,
      }));

      const myJSONformat = combine(myJSONF(), timestamp(), format.json());
      if (fileConfig.logDailyRotation) {
        const transport = new transports.DailyRotateFile({
          filename: this.globalConfig.appName + '-%DATE%.log',
          dirname: fileConfig.logFileDir,
          datePattern: fileConfig.logDailyRotationOptions?.datePattern ?? 'YYYY-MM-DD',
          zippedArchive: fileConfig.logDailyRotationOptions?.zippedArchive ?? true,
          maxSize: fileConfig.logDailyRotationOptions?.maxSize ?? '20m',
          maxFiles: fileConfig.logDailyRotationOptions?.maxFiles,
        });

        const fileLogger = createLogger({
          level: fileConfig.logLevel ?? LogLevel.debug,
          format: myJSONformat,
          transports: [transport],
          silent: fileConfig.silent,
        });

        this.loggers.push(fileLogger);
      } else {
        const logPath = path.join(fileConfig.logFileDir, `${this.globalConfig.appName}.log`);
        const fileLogger = createLogger({
          level: fileConfig.logLevel ?? LogLevel.debug,
          format: myJSONformat,
          transports: [new transports.File({ filename: logPath })],
          silent: fileConfig.silent,
        });
        this.loggers.push(fileLogger);
      }
    }
  }

  /**
   * Change the level of logs
   */
  setLevel(level: LogLevel) {
    this.loggers.forEach(logger => (logger.level = level));
  }
  /**
   * Log a message in debug level
   */
  d(message: string) {
    this.log(LogLevel.debug, message);
  }
  /**
   * Log a message in info level
   */
  i(message: string) {
    this.log(LogLevel.info, message);
  }
  /**
   * Log a message in warning level
   */
  w(message: string) {
    this.log(LogLevel.warning, message);
  }
  /**
   * Log a message in error level
   */
  e(message: string) {
    this.log(LogLevel.error, message);
  }

  private log(level: LogLevel, msg: string) {
    const msgSanitized = sanitizeStr(msg, this.blackListParams);
    this.logToLoggers(level, msgSanitized);
  }

  private logToLoggers(level: LogLevel, msg: string) {
    for (const logger of this.loggers) {
      if (!logger.silent) {
      }
      logger[level](msg);
    }
  }
}

export default LogService;
