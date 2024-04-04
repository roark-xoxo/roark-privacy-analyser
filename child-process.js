/**
 * @typedef {import('./lib/types.js').ScraperArgs} ScraperArgs
 */

import { getErrorMessage } from "./lib/utils.js";
import { getScrapeResults } from "./lib/scrape.js";

(async () => {
  try {
    const args = getScraperBodyFromProcessArgs();
    const data = await getScrapeResults(args);
    console.log(JSON.stringify(data));
    if (process && process.send) {
      process.send({ data });
    }
  } catch (error) {
    if (process && process.send) {
      process.send({ error: getErrorMessage(error) });
    }
    process.exit(1);
  }
})();

/**
 *
 * @returns {ScraperArgs} - All args to start scraper
 */
function getScraperBodyFromProcessArgs() {
  const processArgs = process.argv[2];
  const body = JSON.parse(processArgs);
  if (!body?.scraper?.url) {
    throw new Error("no url in process.argv[2]");
  }
  return body;
}