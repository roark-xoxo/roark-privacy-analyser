/**
 * @typedef {import('./types').ScrapeResults} ScrapeResults
 * @typedef {import('./types').ScraperOptions} ScraperArgsFeaturesType
 * @typedef {import('./types').ScraperArgs} ScraperArgs
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

/**
 * Retrieves scraping results using Playwright.
 * @param {ScraperArgs} args - The arguments for the scraper.
 * @returns {Promise<ScraperReturnObject>} The results of the scraping process.
 */
export async function getScrapeResultsPlaywright({ url, options }) {
  if (!url) throw new Error("No URL provided");
  if (!options) throw new Error("No settings provided");
  return await runScraper({ url, options });
}

/**
 * Runs the scraper process.
 * @param {object} args - The arguments for the scraper.
 * @param {string} args.url - The URL to scrape.
 * @param {ScraperArgsFeaturesType} args.options - Features/settings for the scraper.
 * @returns {Promise<ScraperReturnObject>} The results of the scraping process.
 */
export async function runScraper({ url, options }) {
  process.setMaxListeners(300);
  const startTime = new Date();
  const { log, headless } = options;
  if (log) logToFile("Started (Playwright):", url);
  const browserType = options?.browser ?? "chromium";
  const { browser, message } = await getPlaywrightBrowser({
    headless,
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

  addExtendedSitePaths(data);
  /** @type {ScrapeResults} */
  const results = {};
  await visitInternalLinksPlaywright({
    page,
    data,
    results,
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
    await bypassCaptcha({ data, results });
  }

  updateResults({ data, results });
  const logMessage = `Finished (Playwright) (success: ${results.success}): ${url}`;
  if (log) logToFile(logMessage);
  results.scrapeTime = getDuration(startTime, new Date());

  return {
    results,
    collectedData: data,
    websiteData: getWebsiteData(results),
  };
}
