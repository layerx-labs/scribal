# Log-Service

Fast and easily write your logs into files and on console, it works with `Ts` as well with `Js` projects.

```ts
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

```ts
import Logger, { InitialConfig } from '@taikai/log-service';
```

or require (if you are working in a js project):

```js
const { default: Logger } = require('@taikai/log-service');
```

#### create a new instance of your Logger

prepare your config object and your blacklist elements (the elements which the info appearing after this should be masked):

```ts
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

:bulb: **Hint:** If you are using a js project, you don't need to specify the types of variables :wink:.

#### start logging

After initiated yhe logger calling the method .init() you can start writing log messages into your files and/or your console depending on the values you set on the initConfig variable:

```ts
logger.i('Log something funny 🚀');
logger.d('I am being debugged 🚫🐞');
logger.w('You are about to love this lib ⚠');
logger.e('Oh no! Something went wrong 😱');
```

### :ice_cream: BONUS: More cool ways to use the Log-Service library!

Find the API docs references on the following link: [API Docs](https://github.com/taikai/log-service)

## Contributing

The way you can contribute to this project is **submitting new features** or **fixing bugs.**

To get started you have to clone this repo to your machine; open your terminal on the folder you want to clone into, and enter the following commands:

```bash
$ git clone https://github.com/taikai/log-service.git
$ cd log-service
$ npm install
```

Now you can create a new branch containing the new feature or bugfix, e.g.: `git checkout -b feature/my_new_feature`. This will make it easier for you to submit a pull request and get your feature merged.

### Test Options

Before submitting, you must pass all the unit tests and syntax checks by running the two commands below:

`npm run test` run all the unit test cases in tests folder

There're also a syntax check commands for you:
`npm run lint`

There is a nested project called **lib-tester** where you can play and see how would work your new feature or bugfix. But first you need to run the `build` script on the root project, then install the dependencies on the nested project using the `npm install` command. It should install the local package NOT the published one:

```json
...
"@taikai/log-service": "file:../taikai-log-service-1.0.0.tgz"
...
```
