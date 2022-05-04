# Log-Service

Fast and easily write your logs into files and on console, it works with `Ts` as well with `Js` projects.

```typescript=
import Logger, { InitialConfig } from '@taikai/log-service';

/*
 * Create the configs for your initializing loggers (console and file)
 * */
const initConfig: InitialConfig = {
  appName: 'My App',
  hostname: 'localhost',
  version: '1.0',
  console: {
    silent: false, // log on console
  },
  file: {
    silent: true, // doesn't log on file
  },
};

const blackListKeys = ['password', 'phoneNumber', 'address'];

const logger = new Logger(blackListKeys, '*');
logger.init(initConfig);
logger.i('Log something funny 🚀');

...
```

## :memo: Where do I start?

### Step 1: Installation

This is a Node.js module available through the npm registry.

Before installing, download and install Node.js. prefer the LTS version.

If this is a brand new project, make sure to create a package.json first with the `npm init` command.

Installation is done using the npm install command:

```bash
$ npm i @taikai/log-service
```

### Step 2: Log something with your logger

#### import the library into your file

use the import statement (in case of a typescript project):

```typescript=
import Logger, { InitialConfig } from '@taikai/log-service';
```

or require (if you are working in a js project):

```javascript=
const { default: Logger } = require('@taikai/log-service');
```

#### create a new instance of your Logger

prepare your config object and your blacklist elements (the elements which the info appearing after this should be masked):

```typescript=
...
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
```

:::info
:bulb: **Hint:** If you are using a js project, you don't need to specify the types of variables :wink:.
:::

#### start logging

After initiated yhe logger calling the method .init() you can start writing log messages into your files and/or your console depending on the values you set on the initConfig variable:

```typescript=
logger.i('Log something funny 🚀');
logger.d('I am being debugged 🚫🐞');
logger.w('You are about to love this lib ⚠');
logger.e('Oh no! Something went wrong 😱');
```

### :ice_cream: BONUS: More cool ways to use the Log-Service library!
