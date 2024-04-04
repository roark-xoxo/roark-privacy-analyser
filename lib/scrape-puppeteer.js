/**
 * @typedef {import('./types').ScrapeResults} ScrapeResults
 * @typedef {import('./types').ScraperOptions} ScraperOptions
 * @typedef {import('./types').ScraperArgs} ScraperArgs
 * @typedef {import('./types').ScraperReturnObject} ScraperReturnObject
 */

import { getPagePuppeteer, getPuppeteerBrowser } from "./browser.js";
import { getDuration, logToFile } from "./utils.js";
import { addExtendedSitePaths, addUrlData } from "./urls.js";
import { visitInternalLinksPuppeteer } from "./visit-urls.js";
import { getCollectedDataObject } from "./data.js";
import { updateResults } from "./results.js";
import { getWebsiteData } from "./form.js";

/**
 * Retrieves scraping results using Puppeteer.
 * @param {ScraperArgs} args - The scraper arguments.
 * @returns {Promise<ScraperReturnObject>} - The scraping results.
 */
export async function getScrapeResultsPuppeteer(args) {
  if (!args.url) throw new Error("No URL provided");
  if (!args.options) throw new Error("No settings provided");

  process.setMaxListeners(300);

  const { url, options } = args;
  const startTime = new Date();

  const { log, headless } = options;
  if (log) logToFile("Started (Puppeteer):", url);

  const { browser, message } = await getPuppeteerBrowser(headless);
  if (!browser) throw new Error(message ?? "Couldn't get Puppeteer Browser");

  const data = getCollectedDataObject();
  data.options = options;
  addUrlData({ url, data });
  const page = await getPagePuppeteer({ browser, data });
  if (!page) throw new Error("Couldn't get Puppeteer Page.");

  data.browsers.puppeteer.browser = browser;
  data.browsers.puppeteer.page = page;

  addExtendedSitePaths(data);
  /** @type {ScrapeResults} */
  const results = {};

  await visitInternalLinksPuppeteer({
    data,
    results,
  });

  try {
    await data.browsers.puppeteer.browser.close();
  } catch (error) {
    if (log) logToFile(url, "error closing browser:", error);
  }

  updateResults({ data, results });
  const logMessage = `Finished (Puppeteer) (success: ${results.success}): ${url}`;
  if (log) logToFile(logMessage);

  results.scrapeTime = getDuration(startTime, new Date());

  return {
    results,
    collectedData: data,
    websiteData: getWebsiteData(results),
  };
}
