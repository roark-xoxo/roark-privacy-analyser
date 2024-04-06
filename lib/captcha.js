import { logging } from "./utils.js";
import { getPagePlaywright, getPlaywrightBrowser } from "./browser.js";
import { visitInternalLinksPlaywright } from "./visit-urls.js";

/**
 * @typedef {import('./types').CollectedData} CollectedData
 * @typedef {import('./types').ScrapeResults} ScrapeResults
 */

/**
 * Attempts to bypass captcha by retrying in Firefox and visiting internal links.
 * @param {object} params - The parameters for the function.
 * @param {CollectedData} params.data - The collected data from scraping.
 * @param {ScrapeResults} params.results - The scraping results.
 * @returns {Promise<ScrapeResults|void>} - The updated scrape results.
 * @since 0.1.0
 */
export const bypassCaptcha = async ({ data, results }) => {
  logging(data.url.hostname, "trying in firefox");
  data.browser = "firefox";
  const { browser } = await getPlaywrightBrowser({
    headless: data.options.headless,
    browserType: "firefox",
  });
  if (!browser) return;
  const { page, context } = await getPagePlaywright({
    browser,
    data,
  });

  if (!page) throw new Error("No page");
  const oldPageCount = data.pagesVisited;
  data.pagesVisited = 0;
  for (const link of data.internalLinks) {
    if (link[1]?.status !== 200) {
      data.internalLinks.set(link[0], { visited: false });
    }
  }

  await visitInternalLinksPlaywright({ data, results });
  data.pagesVisited = oldPageCount + data.pagesVisited;
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
  return results;
};

/**
 * Determines whether the given HTML contains indications of Cloudflare's Turnstile.
 * @param {string} html - The HTML content to check.
 * @returns {boolean} - True if Cloudflare's Turnstile is detected, otherwise false.
 * @since 0.1.0
 */
export function usesCloudflareTurnstyle(html) {
  const texts = [
    "Leistung und Sicherheit von Cloudflare",
    "muss die Sicherheit Ihrer Verbindung überprüfen, bevor Sie fortfahren können.",
    "Es wird geprüft, ob die Site-Verbindung sicher ist",
    "needs to review the security of your connection before proceeding",
  ];
  for (const text of texts) {
    if (html.includes(text)) {
      return true;
    }
  }
  return false;
}
