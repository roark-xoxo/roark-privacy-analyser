/**
 * @typedef {import('./lib/scraper/types.js').ScraperArgsBody} ScraperArgsBody
 */

import { logToFile } from "./lib/helpers/utils.js";
import { getScrapeResults } from "./lib/scraper/scrape.js";

(async () => {
  try {
    const data = await getScrapeResults(getScraperBody());
    console.log(JSON.stringify(data));
  } catch (error) {
    logToFile("getScrapeResults ERROR: ", error);
    console.log(JSON.stringify({ error: error }));
    process.exit(1);
  }
})();

/**
 *
 * @returns {ScraperArgsBody} - All args to start scraper
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
