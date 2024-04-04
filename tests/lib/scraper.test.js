import { expect, test } from "vitest";
import { logToFile } from "../../lib/utils.js";
import { getScrapeResults } from "../../lib/scrape.js";

/**
 * @typedef {import('../../lib/types.js').ScraperArgs} ScraperArgs
 * @typedef {import('../../lib/types.js').ScraperOptions} ScraperOptions
 */

test("Run Scraper with Puppeteer", async () => {
  try {
    const data = await getScrapeResults(getScraperBody());
    logToFile("results:", data.results);
  } catch (error) {
    logToFile("getScrapeResults ERROR: ", error);
    console.log(JSON.stringify({ error: error }));
    process.exit(1);
  }
  expect(true).toBe(true);
});

/**
 *
 * @returns {ScraperArgs} - Args to start scraper
 */
function getScraperBody() {
  try {
    /** @type {ScraperOptions} */
    const options = {
      engine: "puppeteer",
      pageLimit: 144,
      waitUntil: "load",
      log: true,
      headless: false,
      redirectError: "subdomain",
      delay: 50,
    };

    return {
      url: "https://www.roark.at/",
      options,
    };
  } catch (error) {
    logToFile("getScraperBody", error);
    throw error;
  }
}
