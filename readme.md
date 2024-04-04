# Privacy Analyser

A Node.js application that scrapes websites and checks for GDPR privacy violations.

You can try it here: [roark.at/app](https://roark.at/app)

## How to Use

## Getting started

If you are running this for the first time, ensure all dependencies are installed by running

```bash
npm install
```

If you plan to also use Playwright to analyse websites instead of the default Puppeteer you also need to run:

```bash
npx playwright install
```

### Command Line

The simplest way to use it is to execute:

```
node app.js
```

This action will prompt you for the URL you wish to analyse and the maximum number of pages you want analysed. It will then launch the process in the background and deliver the results in the terminal.

### In Script

You can execute this from within another script. All that is required is to import the `getScrapeResults` function and supply it with the correct arguments.

The minimum requirement is as follows:

```js
import { getScrapeResults } from "./lib/scrape.js";

/**
 * @typedef {import('./lib/types.js').ScraperOptions} ScraperOptions
 */

/** @type {ScraperOptions} */
const options = {
  engine: "puppeteer",
  pageLimit: 5,
  log: false,
  waitUntil: "load",
};

(async () => {
  const data = await getScrapeResults({ url: "google.com", options });
  console.log(data);
})();
```

Also, have a look at the [example.js](https://github.com/roark-xoxo/roark-privacy-analyser/blob/main/example.js) file.

### Child Process

You can execute the `child-process.js` file from another Bun or Node app via child_process and listen for the results via IPC.
