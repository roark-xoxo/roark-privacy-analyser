/**
 * @typedef {import('./lib/types.js').ScraperArgs} ScraperArgs
 */

import { getErrorMessage } from "./lib/utils.js";
import { getScrapeResults } from "./lib/scrape.js";

(async () => {
  try {
    const { url, options } = getScraperBodyFromProcessArgs();
    if (options.log === true) process.env.LOG = "IPC_MESSAGE";
    const data = await getScrapeResults(url, options);
    if (!data.results) {
      throw new Error("Error geting results.");
    }
    if (process && process.send) {
      process.send({ data: data.results, error: false });
    }
  } catch (error) {
    if (process && process.send) {
      process.send({ data: null, error: getErrorMessage(error) });
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
  if (!body?.url) {
    throw new Error("no url in process.argv[2]");
  }
  return body;
}
