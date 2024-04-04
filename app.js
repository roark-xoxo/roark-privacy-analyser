import { getErrorMessage, logToFile } from "./lib/utils.js";
import { getScrapeResults } from "./lib/scrape.js";
import readline from "readline";

/**
 * @typedef {import('./lib/types.js').ScraperOptions} ScraperOptions
 */

(async () => {
  try {
    const { url, pageLimit } = await getScraperBody();
    /** @type {ScraperOptions} */
    const options = {
      engine: "puppeteer",
      pageLimit: pageLimit,
      log: false,
      waitUntil: "load",
    };
    const data = await getScrapeResults({ url, options });
    console.log(data);
  } catch (error) {
    logToFile("getScrapeResults ERROR: ", getErrorMessage(error));
    console.log({ error: getErrorMessage(error) });
    process.exit(1);
  }
})();

/**
 *
 * @returns {Promise<{url:string,pageLimit:number}>} - All args to start scraper
 */
async function getScraperBody() {
  return new Promise((resolve, reject) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question("URL to analyse: ", (url) => {
      rl.question("Max pages to visit (default 5): ", (maxPages) => {
        let pageLimit = maxPages.trim() ? parseInt(maxPages, 10) : 5;
        pageLimit = isNaN(pageLimit) || pageLimit < 1 ? 5 : pageLimit;

        rl.close();

        if (!url) {
          reject(new Error("URL is required"));
        } else {
          resolve({ url, pageLimit });
        }
      });
    });
  });
}
