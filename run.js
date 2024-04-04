/**
 * @typedef {import('./lib/types.js').ScraperArgs} ScraperArgs
 */

import { getErrorMessage, logToFile } from "./lib/utils.js";
import { getScrapeResults } from "./lib/scrape.js";

(async () => {
  try {
    const data = await getScrapeResults(getScraperBody());
    console.log(JSON.stringify(data));
  } catch (error) {
    logToFile("getScrapeResults ERROR: ", getErrorMessage(error));
    console.log(JSON.stringify({ error: getErrorMessage(error) }));
    process.exit(1);
  }
})();

/**
 *
 * @returns {ScraperArgs} - All args to start scraper
 */
function getScraperBody() {
  try {
    const processArgs = process.argv[2];
    const body = JSON.parse(processArgs);
    if (!body?.scraper?.url) {
      throw new Error("no url in process.argv[2]");
    }
    return body;
  } catch (error) {
    logToFile("getScraperBody", error);
    throw error;
  }
}
