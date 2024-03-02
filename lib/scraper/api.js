/**
 * @typedef {import('./types').RedirectErrorOptions} RedirectErrorOptions
 * @typedef {import('./types').ScrapeEngine} ScrapeEngine
 * @typedef {import('./types').ScraperArgsBody} ScraperArgsBody
 * @typedef {import('./types').ScraperArgsFeaturesType} ScraperArgsFeaturesType
 * @typedef {import('./types').ScraperArgsType} ScraperArgsType
 * @typedef {import('./types').WaitUntilOptions} WaitUntilOptions
 * @typedef {*} T - A generic type placeholder for any object.
 */

import {
  isValidRoarkApiToken,
  validateBodyAirtableArgs,
  validateBoolean,
  validateNumber,
  validateString,
} from "../helpers/validation.js";

/**
 * Retrieves the request body from the context as a JSON object.
 * @async
 * @function getBodyFromContext
 * @param {object} c - The request context.
 * @param {any} c.req - The request context.
 * @returns {Promise<T>} The request body parsed as JSON.
 * @since 1.0.0
 */
async function getBodyFromContext(c) {
  return await c.req.json();
}

/**
 * Extracts scraper body from the context.
 * @async
 * @function getScraperBody
 * @param {object} c - The request context.
 * @returns {Promise<ScraperArgsBody>} The scraper body arguments.
 * @since 1.0.0
 */
export async function getScraperBody(c) {
  const validToken = isValidRoarkApiToken(c);
  /** @type {ScraperArgsBody} */
  const body = await getBodyFromContext(c);
  const url = getUrlFromBody(body);

  return {
    scraper: {
      url,
      features:
        validToken === true ? getFeaturesFromBody(body) : getDefaultFeatures(),
    },
  };
}

/**
 * Extracts the URL from scraper arguments.
 * @function getUrlFromBody
 * @param {ScraperArgsType} body - The scraper arguments.
 * @returns {string} The URL extracted from the arguments.
 * @since 1.0.0
 */
function getUrlFromBody(body) {
  const { url } = body;
  if (!url || typeof url !== "string" || url.trim() === "") {
    throw new Error("Keine URL");
  }

  return url;
}

/**
 * Extracts scraper features from the body.
 * @function getFeaturesFromBody
 * @param {ScraperArgsType} body - The scraper arguments.
 * @returns {ScraperArgsFeaturesType} The features extracted.
 * @since 1.0.0
 */
function getFeaturesFromBody({ features }) {
  if (!features) return getDefaultFeatures();

  return {
    engine: validateEngine(features.engine),
    pageLimit: validateNumber(features.pageLimit) || 5,
    log: validateBoolean(features.log),
    privacyPage: validateBoolean(features.privacyPage),
    emails: validateBoolean(features.emails),
    clickElement: validateString(features.clickElement) || null,
    sitemapUrl: validateString(features.sitemapUrl) || null,
    sitemapSearch: validateBoolean(features.sitemapSearch),
    delay: validateNumber(features.delay) || null,
    waitUntil: validateWaitUntil(features.waitUntil),
    redirectError: validateRedirectError(features.redirectError) || null,
    browser: features.browser === "firefox" ? "firefox" : "chromium",
    browserMode: features.browserMode === "headful" ? "headful" : "headless",
    scroll: validateBoolean(features.scroll),
    extendedSitePaths: validateBoolean(features.extendedSitePaths),
    queuePriority: validateNumber(features.queuePriority) || undefined,
  };
}

/**
 * Validates the given engine string and returns a valid ScrapeEngine type.
 * @function validateEngine
 * @param {string|null} [engine] - The engine string to validate.
 * @returns {ScrapeEngine} The validated engine type.
 * @since 1.0.0
 */
function validateEngine(engine) {
  if (engine === "puppeteer") return "puppeteer";
  if (engine === "both") return "both";
  return "playwright";
}

/**
 * Validates the given waitUntil string and returns a valid WaitUntilOptions type.
 * @function validateWaitUntil
 * @param {string|null} [waitUntil] - The waitUntil string to validate.
 * @returns {WaitUntilOptions} The validated waitUntil option.
 * @since 1.0.0
 */
function validateWaitUntil(waitUntil) {
  if (waitUntil === "domcontentloaded") return "domcontentloaded";
  if (waitUntil === "networkidle0") return "networkidle0";
  if (waitUntil === "networkidle2") return "networkidle2";
  if (waitUntil === "load") return "load";
  return "networkidle2";
}

/**
 * Validates the given text and returns a valid RedirectErrorOptions type.
 * @function validateRedirectError
 * @param {string|null} [text] - The text to validate for redirect error options.
 * @returns {RedirectErrorOptions|null} The validated redirect error option or null.
 * @since 1.0.0
 */
function validateRedirectError(text) {
  if (text === "domain") return "domain";
  if (text === "subdomain") return "subdomain";
  return null;
}

/**
 * Provides default scraping features.
 * @function getDefaultFeatures
 * @returns {ScraperArgsFeaturesType} The default features for scraping.
 * @since 1.0.0
 */
function getDefaultFeatures() {
  return {
    pageLimit: 5,
    log: false,
    waitUntil: "networkidle",
    engine: "playwright",
  };
}

/**
 * Retrieves scraper body for Airtable endpoint from context.
 * @async
 * @function getBodyFromScraperAirtableEndpoint
 * @param {object} c - The request context.
 * @returns {Promise<ScraperArgsBody>} The scraper body arguments for Airtable.
 * @since 1.0.0
 */
export async function getBodyFromScraperAirtableEndpoint(c) {
  /** @type {ScraperArgsBody} */
  const body = await getBodyFromContext(c);
  validateBodyAirtableArgs(body);
  return {
    airtable: body.airtable,
    scraper: {
      url: getUrlFromBody(body?.scraper),
      features: getFeaturesFromBody(body?.scraper),
    },
  };
}
