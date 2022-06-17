import Scribal, { InitialConfig } from '@taikai/scribal';
import path from 'path';

const initConfig: InitialConfig = {
  appName: 'My App',
  hostname: 'localhost',
  version: '1.0',
  console: {
    silent: false,
    prettify: false,
  },
  file: {
    silent: false,
    logFileDir: path.resolve('logs'),
  },
};

const blackListKeys = ['password', 'phoneNumber', 'address'];

const logger = new Scribal(blackListKeys, '*');
logger.init(initConfig);
const person = {
  name: 'marshall',
  age: 25,
  address: {
    country: 'Angola',
    province: 'Luanda',
  },
  phoneNumber: '+244 999 999 999',
  email: 'marshall@taikai.network',
  logins: [
    {
      username: 'marshall',
      password: '123qwe123',
    },
    {
      username: 'taikai1',
      password: '1969',
    },
  ],
};

logger.addLogger(() => ({
  log(level, message) {
    console.log('loggerPlugin :>> ', `${level} - ${message}`);
  },
}));

logger.i(['Find my personal information', person, 'Hope you enjoy']);
logger.d('I am being debugged 🚫🐞');
logger.w('You are about to love this lib ⚠');
logger.e('Oh no! Something went wrong 😱');
logger.i('Nevermind', 'its all okay 💯');

export {};
