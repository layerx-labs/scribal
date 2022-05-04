import Logger, { InitialConfig } from '@marshall-taikai/log-service';

const initConfig: InitialConfig = {
  appName: 'My App',
  hostname: 'localhost',
  version: '1.0',
  console: {
    silent: false,
  },
  file: {
    silent: true,
  },
};

const blackListKeys = ['password', 'phoneNumber', 'address'];

const logger = new Logger(blackListKeys, '*');
logger.init(initConfig);

logger.i('Log something funny 🚀 ');

export {};
