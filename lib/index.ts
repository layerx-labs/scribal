import 'winston-daily-rotate-file';

import {
  ConsoleConfig,
  FileConfig,
  FormatOptions,
  InitialConfig,
  LoggerPlugin,
  LogLevel,
  PluginConfig,
} from '@types';
import sanitize from '@utils/sanitizers';
import path from 'path';
import process from 'process';
import { createLogger, format, Logger, transports } from 'winston';

const { combine, timestamp, label, printf, prettyPrint } = format;

/**
 *
 */
class Scribal {
  private loggers: LoggerPlugin[];
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

  private simplifyPrint() {
    return printf((info) => {
      const {
        timestamp: timestampInfo,
        label: labelInfo,
        level: levelInfo,
        message: messageInfo,
        ...restOfInfo
      } = info;
      return `${timestampInfo} [${labelInfo.toString().padStart(5, ' ')}] ${levelInfo}: ${
        Object.keys(restOfInfo).length
          ? JSON.stringify({ message: messageInfo, ...restOfInfo }, (_key, value) =>
              typeof value === 'bigint' ? Number(value) : value
            )
          : typeof messageInfo === 'string'
          ? messageInfo
          : JSON.stringify(messageInfo, (_key, value) =>
              typeof value === 'bigint' ? Number(value) : value
            )
      }`;
    });
  }

  private addConsoleLogger(consoleConfig: ConsoleConfig) {
    if (consoleConfig && !consoleConfig.silent) {
      const formatter = combine(
        label({ label: process.pid.toString() }),
        timestamp(),
        consoleConfig.prettify ? prettyPrint({ colorize: true, depth: 4 }) : this.simplifyPrint()
      );
      const consoleLogger = createLogger({
        level: consoleConfig.logLevel ?? LogLevel.debug,
        format: formatter,
        transports: [new transports.Console()],
        silent: consoleConfig.silent,
      });
      this.loggers.push(consoleLogger);
    }
  }

  private addFileLoggers(fileConfig: FileConfig) {
    if (fileConfig && !fileConfig.silent) {
      const simpleFormatter = format((info, opts) => ({
        ...info,
        pid: process.pid,
        hostname: this.globalConfig.hostname,
        application: this.globalConfig.appName,
        version: this.globalConfig.version,
      }));

      const formatter = combine(simpleFormatter(), timestamp(), format.json());
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
          format: formatter,
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
          format: formatter,
          transports: [new transports.File({ filename: logPath })],
          silent: fileConfig.silent,
        });
        this.loggers.push(fileLogger);
      }
    }
  }

  private overwriteMethods(logger: Logger, plugin: LoggerPlugin, formatOptions?: FormatOptions) {
    const { transform } = combine(
      label({ label: process.pid.toString() }),
      timestamp(),
      formatOptions?.prettify ? prettyPrint({ depth: 4 }) : this.simplifyPrint()
    );
    const levels = Object.values(LogLevel);
    for (const level of levels) {
      logger[level] = (msg: any) => {
        const index = levels.indexOf(logger.level as LogLevel);
        if (index === -1 || levels.slice(index).includes(level)) {
          if (formatOptions) {
            const transformedMsg = transform({ level: level, message: msg });
            const symbolKey = Object.getOwnPropertySymbols(transformedMsg)[0];
            return plugin.log(level, (transformedMsg as any)[symbolKey]) as any;
          }
          return plugin.log(level, msg) as any;
        }
      };
    }
  }

  addLogger(
    loggerPluginMaker: (config: InitialConfig) => LoggerPlugin,
    pluginConfig: PluginConfig = { level: LogLevel.debug, silent: false }
  ) {
    const loggerPlugin: LoggerPlugin = loggerPluginMaker.call(this, this.globalConfig);

    if (!loggerPlugin.hasOwnProperty('log'))
      throw new Error(
        `Invalid Logger, missing the required method: "log(level: string, msg: any)=>void"`
      );

    const newLogger = createLogger({
      level: pluginConfig.level,
      silent: pluginConfig.silent,
      transports: [new transports.Console({ silent: true })],
    });

    this.overwriteMethods(newLogger, loggerPlugin, pluginConfig.format);

    this.loggers.push(newLogger);
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
   * @param contents all the contents you intend to log in console/file, each content can be of any type of data
   */
  d(...contents: any[]) {
    contents.forEach((content) => {
      this.log(LogLevel.debug, content);
    });
  }

  /**
   * Log a content on info level
   * @param contents all the contents you intend to log in console/file, each content can be of any type of data
   */
  i(...contents: any[]) {
    contents.forEach((content) => {
      this.log(LogLevel.info, content);
    });
  }

  /**
   * Log a content on warning level
   * @param contents all the contents you intend to log in console/file, each content can be of any type of data
   */
  w(...contents: any[]) {
    contents.forEach((content) => {
      this.log(LogLevel.warning, content);
    });
  }

  /**
   * Log a content on error level
   * @param contents all the contents you intend to log in console/file, each content can be of any type of data
   */
  e(...contents: any[]) {
    contents.forEach((content) => {
      this.log(LogLevel.error, content);
    });
  }

  private log(level: LogLevel, content: any) {
    const msgSanitized = sanitize(content, this.blackListParams, this.mask);
    this.logToLoggers(level, msgSanitized);
  }

  private logToLoggers(level: LogLevel, msg: string) {
    this.loggers.forEach((logger) => {
      if (!logger.silent) {
        logger[level](msg);
      }
    });
  }
}

export * from '@types';
export default Scribal;
