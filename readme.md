# Privacy Analyser

A Node.js app that scrapes websites and checks for GDPR privacy violations.

You can try it here: [roark.at/app](https://roark.at/app)

## How to Use

If you are running this for the first time, ensure all dependencies are installed and run `npm install`.

### Command Line

The easiest way to use it is to execute:

```
node app.js
```

This will prompt you for the URL you want to analyse and the maximum number of pages you want analysed, then launch the process in the background and deliver the results in the terminal.

### In Script

You can execute this from within another script. All you need to do is import the `getScrapeResults` function and provide it with the correct arguments.

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

Also, check out the `example.js` file.

### Child Process

You can execute the `child-process.js` file from another Bun or Node app via child_process and listen for the results via IPC.

## Playwright

To properly run Playwright, `npm install` is often not sufficient. You also need to execute:

```bash
npx playwright install
```