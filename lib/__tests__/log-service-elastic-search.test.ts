import { InitialConfig, ElasticSearchClient, LogLevel } from "../types/index";
import path from 'path';
import LogService from '../index';

const elasticClientMock: ElasticSearchClient = {
  push: jest.fn(),
  ping: jest.fn(),
  updateStatus: jest.fn(),
  pushTx: jest.fn(),
  getClient: jest.fn(),
  isEnabled: jest.fn(),
};

const initConfigBase = {
  appName: 'My App',
  hostname: 'localhost',
  version: '1.0',
  console: {
    silent: false,
    prettify: false,
  },
}

describe('When I configure to send every log', () => {
  const initConfig: InitialConfig = {
    ...initConfigBase,
    elasticSearch: {
      client: elasticClientMock,
      targets: ['*']
    }
  };

  const logger = new LogService();
  logger.init(initConfig);

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

describe('When I configure without targets', () => {
  const initConfig: InitialConfig = {
    ...initConfigBase,
    elasticSearch: {
      client: elasticClientMock
    }
  };

  const logger = new LogService();
  logger.init(initConfig);

  it('Send on `info`', () => {
    logger.i('Nevermind', 'its all okay 💯');
    expect(elasticClientMock.push).not.toHaveBeenCalled();
  });

  it('Send on `debug`', () => {
    logger.d('I am being debugged 🚫🐞');
    expect(elasticClientMock.push).not.toHaveBeenCalled();
  });

  it('Send on `warning`', () => {
    logger.w('You are about to love this lib ⚠');
    expect(elasticClientMock.push).not.toHaveBeenCalled();
  });

  it('Send on `error`', () => {
    logger.e('Oh no! Something went wrong 😱');
    expect(elasticClientMock.push).not.toHaveBeenCalled();
  });
});

describe('When I configure to send log specific ', () => {
  const initConfig: InitialConfig = {
    ...initConfigBase,
    elasticSearch: {
      client: elasticClientMock,
      targets: [LogLevel.info, LogLevel.debug]
    }
  };

  const logger = new LogService();
  logger.init(initConfig);

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
    expect(elasticClientMock.push).not.toHaveBeenCalled();
  });

  it('Send on `error`', () => {
    logger.e('Oh no! Something went wrong 😱');
    expect(elasticClientMock.push).not.toHaveBeenCalled();
  });
});

describe('When I configure to call custom function', () => {
  const initConfig: InitialConfig = {
    ...initConfigBase,
    elasticSearch: {
      client: elasticClientMock,
    }
  };

  const logger = new LogService();
  logger.init(initConfig);

  it('Send on `info`', () => {
    logger.i('Nevermind', 'its all okay 💯').call((options, config) => {
      const elastic = config.elasticSearch.client;

      elastic.push(options.loglevel, {
        message: options.contents
      });
    });

    expect(elasticClientMock.push).toHaveBeenCalled();
  });
});

describe('When I configure without targets and send manually', () => {
  const initConfig: InitialConfig = {
    ...initConfigBase,
    elasticSearch: {
      client: elasticClientMock,
    }
  };

  const logger = new LogService();
  logger.init(initConfig);

  it('Send on `info`', () => {
    logger.i('Nevermind', 'its all okay 💯').send();
    expect(elasticClientMock.push).toHaveBeenCalled();
  });
});
