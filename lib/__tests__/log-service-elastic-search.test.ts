import LogService from '../index';

const initConfig = {
  appName: 'My App',
  hostname: 'localhost',
  version: '1.0',
};

const elasticClientMock = {
  push: jest.fn().mockResolvedValue(true),
};
let sut = new LogService();

const resetSut = () => {
  sut = new LogService();
};

const elasticLogger = (config: any) => {
  const log = (index: string, content: any) => {
    elasticClientMock.push(index, {
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
    debug: (content: any) => log('debug-log', content),
  };
};

afterEach(() => {
  jest.resetAllMocks();
});

describe('When configured with silent "false"', () => {
  beforeAll(() => {
    sut.init(initConfig);

    const elasticLoggerConfig = {
      silent: false,
      level: 'debug',
    };

    sut.addLogger(elasticLogger, elasticLoggerConfig);
  });

  it('Send on `info`', () => {
    sut.i('Nevermind', 'its all okay 💯');
    expect(elasticClientMock.push).toHaveBeenCalledTimes(2);
    expect(elasticClientMock.push).toHaveBeenCalledWith(
      'info-log',
      expect.objectContaining({ appName: initConfig.appName, version: initConfig.version })
    );
  });

  it('Send on `debug`', () => {
    sut.d('I am being debugged');
    expect(elasticClientMock.push).toHaveBeenCalledTimes(1);
    expect(elasticClientMock.push).toHaveBeenCalledWith(
      'debug-log',
      expect.objectContaining({
        appName: initConfig.appName,
        version: initConfig.version,
        message: 'I am being debugged',
      })
    );
  });

  it('Send on `warning`', () => {
    sut.w('You are about to love this lib');
    expect(elasticClientMock.push).toHaveBeenCalledTimes(1);
    expect(elasticClientMock.push).toHaveBeenCalledWith(
      'warn-log',
      expect.objectContaining({
        appName: initConfig.appName,
        version: initConfig.version,
        message: 'You are about to love this lib',
      })
    );
  });

  it('Send on `error`', () => {
    sut.e('Oh no! Something went wrong');
    expect(elasticClientMock.push).toHaveBeenCalledTimes(1);
    expect(elasticClientMock.push).toHaveBeenCalledWith(
      'error-log',
      expect.objectContaining({
        appName: initConfig.appName,
        version: initConfig.version,
        message: 'Oh no! Something went wrong',
      })
    );
  });
});

describe('When configured with format options', () => {
  const dateTimeRegex = '\\d{4}\\-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d{1,3}Z';

  beforeAll(() => {
    resetSut();
    sut.init(initConfig);

    const elasticLoggerConfig = {
      silent: false,
      level: 'debug',
      format: { prettify: false },
    };

    sut.addLogger(elasticLogger, elasticLoggerConfig);
  });

  it('Send on `info`', () => {
    sut.i('Nevermind');
    expect(elasticClientMock.push).toHaveBeenCalledTimes(1);
    expect(elasticClientMock.push).toHaveBeenCalledWith(
      'info-log',
      expect.objectContaining({
        appName: initConfig.appName,
        version: initConfig.version,
        message: expect.stringMatching(new RegExp(`${dateTimeRegex} \\[\\d+\\] info: Nevermind`)),
      })
    );
  });

  it('Send on `debug`', () => {
    sut.d({ name: 'taikai', products: ['hackathon', 'dappkit'] });
    expect(elasticClientMock.push).toHaveBeenCalledTimes(1);
    expect(elasticClientMock.push).toHaveBeenCalledWith(
      'debug-log',
      expect.objectContaining({
        appName: initConfig.appName,
        version: initConfig.version,
        message: expect.stringMatching(
          new RegExp(
            `${dateTimeRegex} \\[\\d+\\] debug: \\{\\"name\\":\\"taikai\\",\\"products\\":\\[\\"hackathon\\",\\"dappkit\\"\\]\\}`
          )
        ),
      })
    );
  });
});

describe('When added a logger with insufficient methods', () => {
  beforeAll(() => {
    resetSut();
    sut.init(initConfig);
  });

  it('Throw an error indicating the missing methods', () => {
    const addIncompleteLogger = () =>
      sut.addLogger(() => ({
        error: () => {},
        warn: () => {},
      }));

    expect(addIncompleteLogger).toThrowError(
      /Invalid Logger, missing these required methods: \[(info|debug|\,\s){1,3}\]/
    );
  });
});
