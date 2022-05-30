import { createLogger } from 'winston';
import LogService from '../index';

const initConfig = {
  appName: 'My App',
  hostname: 'localhost',
  version: '1.0',
};

const elasticClientMock = {
  push: jest.fn(),
};

let logger: LogService;

beforeEach(() => {
  elasticClientMock.push = jest.fn();
  
  logger = new LogService();
  logger.init({
    ...initConfig,
    console: {
      silent: false,
      prettify: false,
    }
  });

  const elasticLogger = (config) => {
    const log = (index: string, content: any) => {
      elasticClientMock.push(index,
        {
          message: content,
          createdAt: new Date().toISOString(),
          appName: config.appName,
          version: config.version,
        });
    };

    return {
      error: (content: any) => log('error-log', content),
      warn: (content: any) => log('warn-log', content),
      info: (content: any) => log('info-log', content),
      debug: (content: any) => log('debug-log', content)
    }
  };
  
  const elasticLoggerConfig = {
    silent: false,
    level: 'debug',
  };

  logger.addLogger(elasticLogger, elasticLoggerConfig);
});

describe('When I configure with silent "false"', () => {
  it('Send on `info`', () => {
    logger.i('Nevermind', 'its all okay 💯');
    expect(elasticClientMock.push).toHaveBeenCalledTimes(2);
  });

  it('Send on `debug`', () => {
    logger.d('I am being debugged 🚫🐞');
    expect(elasticClientMock.push).toHaveBeenCalled();
  });

  it('Send on `warning`', () => {
    logger.w('You are about to love this lib ⚠');
    expect(elasticClientMock.push).toHaveBeenCalled();
  });

  it('Send on `error`', () => {
    logger.e('Oh no! Something went wrong 😱');
    expect(elasticClientMock.push).toHaveBeenCalled();
  });
});
