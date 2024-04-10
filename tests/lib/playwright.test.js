import { expect, test } from "vitest";
import { getErrorMessage } from "../../lib/utils.js";
import { getScrapeResults } from "../../lib/scrape.js";

/**
 * @typedef {import('../../lib/types.js').ScraperArgs} ScraperArgs
 * @typedef {import('../../lib/types.js').ScraperOptions} ScraperOptions
 */

test("Run Scraper with Playwright", async () => {
  try {
    const data = await getScrapeResults(getScraperBody());
    console.log(data);
  } catch (error) {
    console.log(getErrorMessage(error));
    console.log(JSON.stringify({ error: error }));
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
      engine: "playwright",
      pageLimit: 1,
      waitUntil: "load",
      log: true,
      headless: false,
      redirectError: "subdomain",
      scroll: true,
      delay: 50,
    };

    return {
      url: "https://www.roark.at/",
      options,
    };
  } catch (error) {
    console.log("getScraperBody", error);
    throw error;
  }
}
