/**
 * @typedef {import('./types').BrowserType} BrowserType
 * @typedef {import('./types').CollectedData} CollectedData
 * @typedef {import('./types').RequestOrResponseHeaders} RequestOrResponseHeaders
 * @typedef {import('playwright').Browser} Browser
 * @typedef {import('playwright').Page} PagePlaywright
 * @typedef {import('puppeteer').Browser} PuppeteerBrowser
 * @typedef {import('puppeteer').Page} PagePuppeteer
 * @typedef {import('puppeteer').HTTPResponse} HTTPResponse
 * @typedef {import('puppeteer').PuppeteerLaunchOptions} PuppeteerLaunchOptions
 */

import { getErrorMessage } from "../helpers/validation.js";
import { addTechStackFromHeader } from "./meta.js";
import {
  getExternalUrlInfos,
  addServiceFromJsFilename,
  isInternalLink,
  isValidUrl,
} from "./urls.js";
import { chromium, devices, firefox } from "playwright";
import puppeteer from "puppeteer";

/**
 * Launches a browser using Playwright.
 * @param {object} args - options
 * @param {boolean} args.headless - Whether to run the browser in headless mode.
 * @param {BrowserType} args.browserType - The type of browser to launch.
 * @returns {Promise<Browser>} A Playwright Browser instance.
 */
export const getBrowserPlaywright = async ({ headless, browserType }) => {
  const options = {
    headless,
    args: ["--ignore-certificate-errors"],
  };

  if (browserType === "firefox") {
    const browser = await firefox.launch(options);
    return browser;
  }

  const browser = await chromium.launch(options);
  return browser;
};

/**
 * Gets a Playwright browser.
 * @param {object} args - Playwright Browser options.
 * @param {boolean|undefined} args.headless - Sets browser mode. Headless by default.
 * @param {BrowserType} args.browserType - Type of browser is either "firefox", "chromium" or "webkit".
 * @returns {Promise<{browser: Browser | null, message: string | null}>} Object containing the browser instance or an error message.
 */
export const getPlaywrightBrowser = async ({ headless, browserType }) => {
  try {
    return {
      browser: await getBrowserPlaywright({
        headless: headless ?? false,
        browserType,
      }),
      message: null,
    };
  } catch (error) {
    return {
      browser: null,
      message: getErrorMessage(error),
    };
  }
};

/**
 * Opens a new page using a Playwright browser instance.
 * @param {object} args - The Playwright browser instance.
 * @param {Browser} args.browser - The Playwright browser instance.
 * @param {CollectedData} args.data - The data to be collected.
 * @returns {Promise<{page: PagePlaywright, context: any}>} An object containing the page and context.
 */
export const getPagePlaywright = async ({ browser, data }) => {
  const desktopChrome = devices["Desktop Firefox HiDPI"];
  const context = await browser.newContext({
    ...desktopChrome,
    geolocation: { latitude: 52.5024789, longitude: 13.356171 },
    permissions: ["geolocation"],
    locale: "de-DE",
    timezoneId: "Europe/Berlin",
  });

  const page = await context.newPage();
  page.on("response", (response) => {
    updatePageInfos({
      page,
      data,
      link: response.url(),
      headers: response.headers(),
    });
  });
  return { page, context };
};

/**
 * Updates page information based on the response.
 * @param {object} args - The URL of the page.
 * @param {string} args.link - The URL of the page.
 * @param {CollectedData} args.data - The data collected from the page.
 * @param {RequestOrResponseHeaders} args.headers - The headers of the response.
 * @param {PagePlaywright | PagePuppeteer} args.page - The page object.
 */
export const updatePageInfos = ({ link, data, headers, page }) => {
  try {
    if (!isValidUrl(link)) return;
    const url = new URL(link);
    const isInternal = isInternalLink({
      internalHostname: data.url.hostname,
      urlHostname: url.hostname,
      compareSubdomains: false,
    });

    if (isInternal === true) {
      addTechStackFromHeader(headers, data.techStack.internal);
      addServiceFromJsFilename(url, data.techStack.internal);
    }

    if (isInternal === false) {
      addTechStackFromHeader(headers, data.techStack.external);
      addServiceFromJsFilename(url, data.techStack.external);
      getExternalUrlInfos({ page, data, url, headers });
    }
  } catch (error) {
    /* empty */
  }
  return;
};

/**
 * Launches a Puppeteer browser instance.
 * @param {object} params - Whether to run the browser in headless mode.
 * @param {false|"new"} params.headless - Whether to run the browser in headless mode.
 * @returns {Promise<PuppeteerBrowser>} A Puppeteer Browser instance.
 */
export const getBrowserPuppeteer = async ({ headless }) => {
  /** @type {PuppeteerLaunchOptions} */
  const options = {
    headless,
    args: ["--ignore-certificate-errors"],
  };

  /** @type {PuppeteerBrowser} */
  const browser = await puppeteer.launch(options);
  return browser;
};

/**
 * Retrieves a Puppeteer browser instance with error handling.
 * @param {boolean} headless - Whether to run the browser in headless mode.
 * @returns {Promise<{browser: PuppeteerBrowser | null, message: string | null}>} An object containing the browser instance or an error message.
 */
export const getPuppeteerBrowser = async (headless) => {
  try {
    return {
      browser: await getBrowserPuppeteer({
        headless: headless === false ? false : "new",
      }),
      message: null,
    };
  } catch (error) {
    return {
      browser: null,
      message: getErrorMessage(error),
    };
  }
};

/**
 * Opens a new page using a Puppeteer browser instance.
 * @param {object} args - The Puppeteer browser instance.
 * @param {PuppeteerBrowser} args.browser - The Puppeteer browser instance.
 * @param {CollectedData} args.data - The data to be collected.
 * @returns {Promise<PagePuppeteer>} The Puppeteer page instance.
 */
export const getPagePuppeteer = async ({ browser, data }) => {
  const [page] = await browser.pages();
  await page.setViewport({ width: 1366, height: 2000 });

  /**
   * Handles the response event of the page.
   * @param {HTTPResponse} response - The HTTP response object.
   */
  page.on("response", (response) => {
    updatePageInfos({
      page,
      data,
      link: response.url(),
      headers: response.headers(),
    });
  });
  return page;
};
