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
