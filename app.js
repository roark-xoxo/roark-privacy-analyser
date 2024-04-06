import { getErrorMessage } from "./lib/utils.js";
import { getScrapeResults } from "./lib/scrape.js";
import readline from "readline";

/**
 * @typedef {import('./lib/types.js').ScraperOptions} ScraperOptions
 */

(async () => {
  try {
    const { url, pageLimit } = await getScraperBodyFromCommandLine();
    const data = await getScrapeResults(url, { pageLimit });
    console.log(data.results);
  } catch (error) {
    console.error({ error: getErrorMessage(error) });
    process.exit(1);
  }
})();

/**
 *
 * @returns {Promise<{url:string,pageLimit:number}>} - All args to start scraper
 */
async function getScraperBodyFromCommandLine() {
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
        if (!url) reject(new Error("URL is required"));
        else resolve({ url, pageLimit });
      });
    });
  });
}
