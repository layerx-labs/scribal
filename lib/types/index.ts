export enum LogLevel {
  debug = 'debug',
  info = 'info',
  warning = 'warn',
  error = 'error',
}

export type ConsoleConfig = {
  /**
   * Silent the console logger (default false)
   */
  silent?: boolean;
  /**
   * The level for the logs in the console
   */
  logLevel?: LogLevel;
  /**
   * Prettify the log message
   */
  prettify?: boolean;
};

export type DailyRotateFileOptions = {
  /**
   * A string representing the moment.js date format to be used for rotating.
   * The meta characters used in this string will dictate the frequency of the file rotation.
   * For example, if your datePattern is simply 'HH' you will end up with 24 log files that are picked up and appended to every day.
   * (default 'YYYY-MM-DD')
   */
  datePattern?: string;
  /**
   * A boolean to define whether or not to gzip archived log files. default `true`
   */
  zippedArchive?: boolean;
  /**
   * Maximum size of the file after which it will rotate.
   * This can be a number of bytes, or units of kb, mb, and gb.
   * If using the units, add 'k', 'm', or 'g' as the suffix.
   * The units need to directly follow the number. (default: '20m')
   */
  maxSize?: string | number;

  /**
   * Maximum number of logs to keep.
   * If not set, no logs will be removed.
   * This can be a number of files or number of days.
   * If using days, add 'd' as the suffix.
   */
  maxFiles?: string | number;
};

export type FileConfig = {
  logDailyRotation?: boolean;
  /**
   * Options to configure the daily rotation
   */
  logDailyRotationOptions?: DailyRotateFileOptions;
  /**
   * Silent the console logger (default false)
   */
  silent?: boolean;
  /**
   * The directory folder to store the log file(s), if not specified, create a `./log/` dir in the current folder
   */
  logFileDir?: string;
  /**
   * The level for the logs in the file
   */
  logLevel?: LogLevel;
};

export type InitialConfig = {
  appName: string;
  version: string;
  hostname: string;
  console?: ConsoleConfig;
  file?: FileConfig;
};

export type FormatOptions = {
  prettify: boolean;
};

export type PluginConfig = {
  silent: boolean;
  level: `${LogLevel}`;
  format?: FormatOptions;
  [property: string]: any;
};

export type LoggerPlugin = {
  [property: string]: any;
  [LogLevel.debug]: (content: any) => void;
  [LogLevel.info]: (content: any) => void;
  [LogLevel.warning]: (content: any) => void;
  [LogLevel.error]: (content: any) => void;
};
