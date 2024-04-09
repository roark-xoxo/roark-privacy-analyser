/**
 * @typedef {import('./types').ScrapeResults} ScrapeResults
 * @typedef {import('./types').ScraperOptions} ScraperOptions
 * @typedef {import('./types').ScraperArgs} ScraperArgs
 * @typedef {import('./types').ScraperReturnObject} ScraperReturnObject
 */

import { getPagePlaywright, getPlaywrightBrowser } from "./browser.js";
import { bypassCaptcha } from "./captcha.js";
import { getCollectedDataObject } from "./data.js";
import { updateResults } from "./results.js";
import { addExtendedSitePaths, addUrlData } from "./urls.js";
import { getDuration, logging } from "./utils.js";
import { visitInternalLinksPlaywright } from "./visit-urls.js";

/**
 * Retrieves scraping results using Playwright.
 * @param {ScraperArgs} args - The arguments for the scraper.
 * @returns {Promise<ScraperReturnObject>} The results of the scraping process.
 */
export async function getScrapeResultsPlaywright({ url, options }) {
  if (!url) throw new Error("No URL provided");
  if (!options) throw new Error("No options provided");

  process.setMaxListeners(300);
  const startTime = new Date();
  logging(`${url} - started scraping with Playwright`);

  const browserType = options?.browser ?? "chromium";
  const { browser, message } = await getPlaywrightBrowser({
    headless: options.headless,
    browserType,
  });
  if (!browser) throw new Error(message ?? "Couldn't get Playwright Browser");

  const data = getCollectedDataObject();
  data.options = options;
  addUrlData({ url, data });
  const { page, context } = await getPagePlaywright({
    browser,
    data,
  });
  if (!page) throw new Error("Couldn't get Playwright Page.");

  data.browsers.playwright.browser = browser;
  data.browsers.playwright.page = page;

  addExtendedSitePaths(data);
  /** @type {ScrapeResults} */
  const results = {};

  await visitInternalLinksPlaywright({
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
  logging(
    `${url} - finished scraping with Playwright ${
      results.success ? "successfully." : "with error."
    }`
  );

  results.scrapeTime = getDuration(startTime, new Date());

  return {
    results,
    collectedData: data,
  };
}
