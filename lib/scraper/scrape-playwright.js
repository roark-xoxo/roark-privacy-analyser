/**
 * @typedef {import('./types').AirtableUpdateScraperArgs} AirtableUpdateScraperArgs
 * @typedef {import('./types').ScrapeResults} ScrapeResults
 * @typedef {import('./types').ScraperArgsFeaturesType} ScraperArgsFeaturesType
 * @typedef {import('./types').ScraperArgsType} ScraperArgsType
 * @typedef {import('./types').ScraperReturnObject} ScraperReturnObject
 */

import { getPagePlaywright, getPlaywrightBrowser } from "./browser.js";
import { bypassCaptcha } from "./captcha.js";
import { getCollectedDataObject } from "./data.js";
import { updateResults } from "./results.js";
import { addExtendedSitePaths, addUrlData } from "./urls.js";
import { getDuration } from "../helpers/dates.js";
import { visitInternalLinksPlaywright } from "./visit-urls.js";
import { getWebsiteData } from "./form.js";
import { logToFile } from "../helpers/utils.js";
import { updateScrapeStatusOnAirtable } from "../airtable/privacy-records.js";

/**
 * Retrieves scraping results using Playwright.
 * @param {ScraperArgsType} args - The arguments for the scraper.
 * @returns {Promise<ScraperReturnObject>} The results of the scraping process.
 */
export async function getScrapeResultsPlaywright({ url, features, airtable }) {
  if (!url) throw new Error("No URL provided");
  if (!features) throw new Error("No settings provided");
  return await runScraper({ url, features, airtable });
}

/**
 * Runs the scraper process.
 * @param {object} args - The arguments for the scraper.
 * @param {string} args.url - The URL to scrape.
 * @param {ScraperArgsFeaturesType} args.features - Features/settings for the scraper.
 * @param {AirtableUpdateScraperArgs} [args.airtable] - Optional Airtable arguments.
 * @returns {Promise<ScraperReturnObject>} The results of the scraping process.
 */
export async function runScraper({ url, features, airtable }) {
  process.setMaxListeners(300);
  const startTime = new Date();
  const { log, browserMode } = features;
  if (log) logToFile("Started (Playwright):", url);
  const browserType = features?.browser ?? "chromium";
  const { browser, message } = await getPlaywrightBrowser({
    browserMode,
    browserType,
  });
  if (!browser) throw new Error(message ?? "no browser");
  const data = getCollectedDataObject();
  addUrlData({ url, data });

  const { page, context } = await getPagePlaywright({
    browser,
    data,
  });

  if (!page) throw new Error("No page");

  addExtendedSitePaths({ features, data });
  /** @type {ScrapeResults} */
  const results = {};
  await visitInternalLinksPlaywright({
    page,
    data,
    features,
    results,
    airtable,
  });

  try {
    await context.close();
  } catch (_e) {
    /* empty */
  }
  try {
    await browser.close();
  } catch (_e) {
    /* empty */
  }

  if (data.usesCloudflareTurnstyle) {
    await bypassCaptcha({ data, features, results });
  }

  updateResults({ data, results });
  const logMessage = `Finished (Playwright) (success: ${results.success}): ${url}`;
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
