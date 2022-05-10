import Logger, { InitialConfig } from '@taikai/log-service';

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

const person = {
  name: 'marshall',
  age: 25,
  address: {
    country: 'Angola',
    province: 'Luanda',
  },
  phoneNumber: '+244 999 999 999',
  email: 'marshall@taikai.network',
  user: [
    {
      username: 'marshall',
      password: '123qwe123',
    },
  ],
};

logger.i('Person info');
logger.i(person);
logger.d('I am being debugged 🚫🐞');
logger.w('You are about to love this lib ⚠');
logger.e('Oh no! Something went wrong 😱');

export {};
