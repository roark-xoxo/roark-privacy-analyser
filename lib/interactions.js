import { logging, delay, getErrorMessage } from "./utils.js";

/**
 * @typedef {import('./types.d.ts').ScraperOptions} ScraperOptions
 * @typedef {import('playwright').Page} Page
 * @typedef {import('puppeteer').Page} PagePuppeteer
 */

/**
 * Clicks an element on a Playwright page based on specified features.
 * @async
 * @function clickElement
 * @param {Page} page - The Playwright page instance.
 * @param {ScraperOptions} features - The features for scraper arguments.
 * @returns {Promise<void>}
 * @since 0.1.0
 */
export async function clickElement(page, features) {
  const clickElement = features.clickElement;
  if (!clickElement) return;
  try {
    const checkElement = await page.$eval(clickElement, (e) => e);
    if (checkElement) {
      await delay(2000);
      await Promise.all([
        page.waitForLoadState("load"),
        page.click(clickElement),
      ]);
      await delay(2000);
    }
  } catch (error) {
    logging(page.url(), `Error clicking element: ${getErrorMessage(error)}`);
  }
  return;
}

/**
 * Clicks an element on a Puppeteer page based on specified features.
 * @async
 * @function clickElementPuppeteer
 * @param {PagePuppeteer} page - The Puppeteer page instance.
 * @param {ScraperOptions} features - The features for scraper arguments.
 * @returns {Promise<void>}
 * @since 0.1.0
 */
export async function clickElementPuppeteer(page, features) {
  const { clickElement } = features;
  if (!clickElement) return;
  try {
    const checkElement = await page.$eval(clickElement, (e) => e);
    if (checkElement) {
      await delay(2000);
      await Promise.all([page.waitForNavigation(), page.click(clickElement)]);
      await delay(2000);
    }
  } catch (error) {
    logging(page.url(), `Error clicking element: ${getErrorMessage(error)}`);
  }
  return;
}

/**
 * Scrolls to the end of a Playwright page.
 * @async
 * @function scrollToPageEnd
 * @param {Page} page - The Playwright page instance.
 * @returns {Promise<void>}
 * @since 0.1.0
 */
export const scrollToPageEnd = async (page) => {
  const maxIterations = 10;
  let iterationCount = 0;
  let previousHeight;
  let newHeight;

  do {
    try {
      previousHeight = await page.evaluate("document.body.scrollHeight");
      await page.evaluate("window.scrollTo(0, document.body.scrollHeight)");
      newHeight = await page.evaluate("document.body.scrollHeight");
      iterationCount++;
    } catch (error) {
      logging(page.url(), "Error while scrolling:", getErrorMessage(error));
      break;
    }
  } while (newHeight !== previousHeight && iterationCount < maxIterations);
};
