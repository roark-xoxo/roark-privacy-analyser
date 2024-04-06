/**
 * @typedef {import('./types').ScrapeResults} ScrapeResults
 * @typedef {import('./types').ScraperOptions} ScraperOptions
 * @typedef {import('./types').ScraperArgs} ScraperArgs
 * @typedef {import('./types').ScraperReturnObject} ScraperReturnObject
 */

import { getPagePuppeteer, getPuppeteerBrowser } from "./browser.js";
import { getDuration, getErrorMessage, logging } from "./utils.js";
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
export async function getScrapeResultsPuppeteer({ url, options }) {
  if (!url) throw new Error("No URL provided");
  if (!options) throw new Error("No options provided");

  process.setMaxListeners(300);
  const startTime = new Date();
  logging(url, "started scraping with Puppeteer");

  const { browser, message } = await getPuppeteerBrowser(options.headless);
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
    logging(url, "Error closing Puppeteer browser:", getErrorMessage(error));
  }

  updateResults({ data, results });
  logging(
    url,
    `finished scraping with Puppeteer ${
      results.success ? "successfully." : "with error."
    }`
  );

  results.scrapeTime = getDuration(startTime, new Date());

  return {
    results,
    collectedData: data,
    websiteData: getWebsiteData(results),
  };
}
