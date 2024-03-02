/**
 * @typedef {import('./types').AirtableUpdateScraperArgs} AirtableUpdateScraperArgs
 * @typedef {import('./types').ScrapeResults} ScrapeResults
 * @typedef {import('./types').ScraperArgsFeaturesType} ScraperArgsFeaturesType
 * @typedef {import('./types').ScraperArgsType} ScraperArgsType
 * @typedef {import('./types').ScraperReturnObject} ScraperReturnObject
 */

import { getPagePuppeteer, getPuppeteerBrowser } from "./browser.js";
import { getDuration } from "../helpers/dates.js";
import { addExtendedSitePaths, addUrlData } from "./urls.js";
import { visitInternalLinksPuppeteer } from "./visit-urls.js";
import { getCollectedDataObject } from "./data.js";
import { updateResults } from "./results.js";
import { getWebsiteData } from "./form.js";
import { logToFile } from "../helpers/utils.js";
import { updateScrapeStatusOnAirtable } from "../airtable/privacy-records.js";

/**
 * Retrieves scraping results using Puppeteer.
 * @param {ScraperArgsType} args - The scraper arguments.
 * @returns {Promise<ScraperReturnObject>} - The scraping results.
 */
export async function getScrapeResultsPuppeteer(args) {
  const { url, features, airtable } = args;

  if (!url) throw new Error("No URL provided");
  if (!features) throw new Error("No settings provided");

  return await runScraper({ url, features, airtable });
}

/**
 * Executes the scraper.
 * @param {object} args - The scraper arguments.
 * @param {string} args.url - The URL to scrape.
 * @param {ScraperArgsFeaturesType} args.features - The features for scraping.
 * @param {AirtableUpdateScraperArgs} [args.airtable] - Additional Airtable arguments.
 * @returns {Promise<ScraperReturnObject>} - The scraping results.
 */
export async function runScraper(args) {
  const { url, features, airtable } = args;

  process.setMaxListeners(300);
  const startTime = new Date();
  const { log, browserMode } = features;
  if (log) logToFile("Started (Puppeteer):", url);

  const { browser, message } = await getPuppeteerBrowser(
    browserMode === "headful" ? false : true
  );
  if (!browser) throw new Error(message ?? "no browser");

  const data = getCollectedDataObject();
  addUrlData({ url, data });
  const page = await getPagePuppeteer({ browser, data });
  if (!page) throw new Error("No page");

  addExtendedSitePaths({ features, data });
  /** @type {ScrapeResults} */
  const results = {};

  await visitInternalLinksPuppeteer({
    page,
    data,
    features,
    results,
    airtable,
  });

  try {
    await browser.close();
  } catch (error) {
    if (log) logToFile(url, "error closing browser:", error);
  }

  updateResults({ data, results });
  const logMessage = `Finished (Puppeteer) (success: ${results.success}): ${url}`;
  if (log) logToFile(logMessage);
  void updateScrapeStatusOnAirtable({
    airtable,
    message: logMessage,
  });

  results.scrapeTime = getDuration(startTime, new Date());

  return {
    results,
    collectedData: data,
    websiteData: getWebsiteData(results),
  };
}
