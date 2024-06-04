/**
 * @typedef {import('./types').ScraperOptions} ScraperOptions
 * @typedef {import("./types.js").WaitUntilOptions} WaitUntilOptions
 * @typedef {import("./types.js").ScrapeEngine} ScrapeEngine
 * @typedef {import("./types.js").RedirectErrorOptions} RedirectErrorOptions
 * @typedef {import("./types.js").BrowserType} BrowserType
 */

/**
 * Normalize scraper options.
 * @param {any} options - Options being passed.
 * @returns {ScraperOptions} - Normalized scraper options.
 */
export function normalizeOptions(options = {}) {
  if (
    typeof options !== "object" ||
    options === null ||
    !(options instanceof Object)
  ) {
    options = {};
  }

  return {
    engine: normalizeBrowserEngineOption(options),
    browser: normalizeBrowserTypeOption(options),
    pageLimit: normalizePageLimit(options),
    log: normalizeLogOption(options),
    clickElement: normalizeClickElementOption(options),
    emails: normalizeEmailOption(options),
    waitUntil: normalizeWaitUntil(options),
    headless: normalizeHeadlessOption(options),
    privacyPage: normalizeFindPrivacyPageUrlsOption(options),
    sitemapSearch: normalizeFindSiteMapsOption(options),
    sitemapUrl: normalizeSitemapUrlOption(options) || null,
    delay: normalizeDelayOption(options),
    redirectError: normalizeRedirectError(options),
    scroll: normalizeScrollOption(options),
    extendedSitePaths: normalizeExtendedSitePathsOption(options),
  };
}

/**
 * Normalizes the browser engine option.
 * @param {object} [options] - The options object containing the engine name to normalize.
 * @returns {ScrapeEngine} The normalized browser engine name.
 */
function normalizeBrowserEngineOption(options = {}) {
  if ("engine" in options && options.engine !== undefined) {
    const engine = options.engine;
    if (engine === "playwright") return "playwright";
    if (engine === "both") return "both";
    if (Array.isArray(engine)) {
      if (engine.includes("playwright") && !engine.includes("puppeteer")) {
        return "playwright";
      }
      if (engine.includes("playwright") && engine.includes("puppeteer")) {
        return "both";
      }
    }
  }
  return "puppeteer";
}

/**
 * Normalizes the page limit value from the options object.
 * @param {object} [options] - The options object containing the page limit to normalize.
 * @returns {number} The normalized page limit value.
 */
function normalizePageLimit(options = {}) {
  if ("pageLimit" in options && options.pageLimit !== undefined) {
    let pageLimit = options.pageLimit;
    if (typeof pageLimit === "string") {
      pageLimit = parseInt(pageLimit, 10);
    }
    if (typeof pageLimit === "number" && !isNaN(pageLimit) && pageLimit > 0) {
      return pageLimit;
    }
  }
  return 3;
}

/**
 * Normalizes the browser type option from the options object.
 * @param {object} [options] - The options object containing the browser type to normalize.
 * @returns {BrowserType} The normalized browser type.
 */
function normalizeBrowserTypeOption(options = {}) {
  if ("browser" in options && options.browser !== undefined) {
    const browser = options.browser;
    if (browser === "firefox") return "firefox";
  }
  return "chromium";
}

/**
 * Normalizes the waitUntil option from the options object.
 * @param {object} [options] - The options object containing the waitUntil option to normalize.
 * @returns {WaitUntilOptions} The normalized waitUntil option.
 */
function normalizeWaitUntil(options = {}) {
  if ("waitUntil" in options && options.waitUntil !== undefined) {
    const waitUntil = options.waitUntil;
    if (waitUntil === "domcontentloaded") return "domcontentloaded";
    if (waitUntil === "networkidle0") return "networkidle0";
    if (waitUntil === "networkidle2") return "networkidle2";
    if (waitUntil === "load") return "load";
  }
  return "networkidle2";
}

/**
 * Normalizes the redirect error option from the options object.
 * @param {object} [options] - The options object containing the redirect error option to normalize.
 * @returns {RedirectErrorOptions} The normalized redirect error option.
 */
function normalizeRedirectError(options = {}) {
  if ("redirectError" in options && options.redirectError !== undefined) {
    const redirectError = options.redirectError;
    if (redirectError === "domain") return "domain";
    if (redirectError === "subdomain") return "subdomain";
  }
  return null;
}

/**
 * Normalizes the logging option from the options object.
 * @param {object} [options] - The options object containing the logging option to normalize.
 * @returns {boolean} The normalized logging option.
 */
function normalizeLogOption(options = {}) {
  if ("log" in options && options.log !== undefined) {
    const log = options.log;
    if (log === true) return true;
  }
  return false;
}

/**
 * Normalizes the email option from the options object.
 * @param {object} [options] - The options object containing the email option to normalize.
 * @returns {boolean} The normalized email option.
 */
function normalizeEmailOption(options = {}) {
  if ("email" in options && options.email !== undefined) {
    const email = options.email;
    if (email === true) return true;
  }
  return false;
}

/**
 * Normalizes the headless option from the options object.
 * @param {object} [options] - The options object containing the headless option to normalize.
 * @returns {boolean} The normalized headless option.
 */
function normalizeHeadlessOption(options = {}) {
  if ("headless" in options && options.headless !== undefined) {
    const headless = options.headless;
    if (headless === false) return false;
  }
  return true;
}

/**
 * Normalizes the click element option from the options object.
 * @param {object} [options] - The options object containing the click element option to normalize.
 * @returns {string|null} The normalized click element option.
 */
function normalizeClickElementOption(options = {}) {
  if ("clickElement" in options && options.clickElement !== undefined) {
    const clickElement = options.clickElement;
    return normalizeString(clickElement);
  }
  return null;
}

/**
 * Normalizes the find privacy page URLs option from the options object.
 * @param {object} [options] - The options object containing the find privacy page URLs option to normalize.
 * @returns {boolean} The normalized find privacy page URLs option.
 */
function normalizeFindPrivacyPageUrlsOption(options = {}) {
  if ("privacyPage" in options && options.privacyPage !== undefined) {
    const privacyPage = options.privacyPage;
    return normalizeBoolean(privacyPage);
  }
  return false;
}

/**
 * Normalizes the find sitemaps option from the options object.
 * @param {object} [options] - The options object containing the find sitemaps option to normalize.
 * @returns {boolean} The normalized find sitemaps option.
 */
function normalizeFindSiteMapsOption(options = {}) {
  if ("sitemapSearch" in options && options.sitemapSearch !== undefined) {
    const sitemapSearch = options.sitemapSearch;
    return normalizeBoolean(sitemapSearch);
  }
  return false;
}

/**
 * Normalizes the extended site paths option from the options object.
 * @param {object} [options] - The options object containing the extended site paths option to normalize.
 * @returns {boolean} The normalized extended site paths option.
 */
function normalizeExtendedSitePathsOption(options = {}) {
  if (
    "extendedSitePaths" in options &&
    options.extendedSitePaths !== undefined
  ) {
    const extendedSitePaths = options.extendedSitePaths;
    return normalizeBoolean(extendedSitePaths);
  }
  return false;
}

/**
 * Normalizes the scroll option from the options object.
 * @param {object} [options] - The options object containing the scroll option to normalize.
 * @returns {boolean} The normalized scroll option.
 */
function normalizeScrollOption(options = {}) {
  if ("scroll" in options && options.scroll !== undefined) {
    const scroll = options.scroll;
    return normalizeBoolean(scroll);
  }
  return false;
}

/**
 * Normalizes the sitemap URL option from the options object.
 * @param {object} [options] - The options object containing the sitemap URL option to normalize.
 * @returns {string|null} The normalized sitemap URL option.
 */
function normalizeSitemapUrlOption(options = {}) {
  if ("sitemapUrl" in options && options.sitemapUrl !== undefined) {
    const sitemapUrl = options.sitemapUrl;
    return normalizeString(sitemapUrl);
  }
  return null;
}

/**
 * Normalizes the delay option from the options object.
 * @param {object} [options] - The options object containing the delay option to normalize.
 * @returns {number} The normalized delay option.
 */
function normalizeDelayOption(options = {}) {
  if ("delay" in options && options.delay !== undefined) {
    let delay = options.delay;
    if (typeof delay === "string") {
      delay = parseInt(delay, 10);
    }
    if (typeof delay === "number" && !isNaN(delay) && delay >= 0) {
      return delay;
    }
  }
  return 500;
}

/**
 * Normalizes if the given value is a boolean.
 * @param {unknown} value - The value to be normalized.
 * @returns {boolean} The boolean state of the value.
 */
function normalizeBoolean(value) {
  return typeof value === "boolean" ? value : false;
}

/**
 * Normalizes if the given value is a string.
 * @param {unknown} value - The value to be normalized.
 * @returns {string|null} The string value or null if invalid.
 */
function normalizeString(value) {
  return typeof value === "string" ? value : null;
}
