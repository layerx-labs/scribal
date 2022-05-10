import 'winston-daily-rotate-file';

import { ConsoleConfig, FileConfig, InitialConfig, LogLevel } from '@types';
import sanitize from '@utils/sanitizers';
import path from 'path';
import process from 'process';
import { createLogger, format, Logger, transports } from 'winston';

const { combine, timestamp, label, printf } = format;

const myFormat = printf(
  (info) =>
    `${info.timestamp} [${info.label.toString().padStart(5, ' ')}] ${info.level}: ${info.message}`
);

/**
 *
 */
class LogService {
  private loggers: Logger[];
  private blackListParams: string[];
  private globalConfig: InitialConfig;
  private mask: string;

  /**
   *
   * @param _blackListParams A list of keys which value should be masked on the logs
   * @param _mask The custom mask to be used when
   */
  constructor(_blackListParams?: string[], _mask?: string) {
    this.loggers = [];
    this.blackListParams = _blackListParams ?? [];
    this.mask = _mask ?? '*';
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
    this.blackListParams = this.blackListParams.filter((param) => param !== _blackListParam);
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
          filename: `${this.globalConfig.appName}-%DATE%.log`,
          dirname: fileConfig.logFileDir ?? './logs/',
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
        const logPath = path.join(
          fileConfig.logFileDir ?? './logs/',
          `${this.globalConfig.appName}.log`
        );
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
    this.loggers.forEach((logger) => {
      logger.level = level;
    });
  }

  /**
   * Log a content on debug level
   * @param content the content to be logged in console/file, it can be of any type of data
   */
  d(content: any) {
    this.log(LogLevel.debug, content);
  }

  /**
   * Log a content on info level
   * @param content the content to be logged in console/file, it can be of any type of data
   */
  i(content: any) {
    this.log(LogLevel.info, content);
  }

  /**
   * Log a content on warning level
   * @param content the content to be logged in console/file, it can be of any type of data
   */
  w(content: any) {
    this.log(LogLevel.warning, content);
  }

  /**
   * Log a content on error level
   * @param content the content to be logged in console/file, it can be of any type of data
   */
  e(content: any) {
    this.log(LogLevel.error, content);
  }

  private log(level: LogLevel, content: any) {
    const msgSanitized = sanitize(content, this.blackListParams, this.mask);
    this.logToLoggers(level, msgSanitized);
  }

  private logToLoggers(level: LogLevel, msg: string) {
    this.loggers.forEach((logger) => {
      if (!logger.silent) {
        logger[level](JSON.stringify(msg));
      }
    });
  }
}

export * from '@types';
export default LogService;
