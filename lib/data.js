/**
 * @typedef {import('./types').CollectedData} CollectedData
 * @typedef {import('./types').EmailAddresses} EmailAddresses
 * @typedef {import('./types').ExternalLinksMap} ExternalLinksMap
 * @typedef {import('./types').InternalLinksMap} InternalLinksMap
 * @typedef {import('./types').CookiesMap} CookiesMap
 * @typedef {import('./types').ScriptsMap} ScriptsMap
 * @typedef {import('./types').TechStack} TechStack
 * @typedef {import('./types').ScraperOptions} ScraperOptions
 */
/**
 * Creates and returns an object representing the data collected by the scraper.
 * The object includes various properties such as browser, internal and external links,
 * scripts, tech stack, cookies, email addresses, page information, and URL details.
 * @function getCollectedDataObject
 * @returns {CollectedData} - An object with the structure defined in the CollectedData type.
 * @since 0.1.0
 */
export function getCollectedDataObject() {
  /** @type {InternalLinksMap} */
  const internalLinks = new Map();

  /** @type {ExternalLinksMap} */
  const externalLinks = new Map();

  /** @type {ScriptsMap} */
  const scripts = new Map();

  /** @type {TechStack} */
  const internalTechStack = new Set();

  /** @type {TechStack} */
  const externalTechStack = new Set();

  /** @type {CookiesMap} */
  const cookies = new Map();

  /** @type {EmailAddresses} */
  const emailAddresses = new Set();

  /** @type {ScraperOptions} */
  const options = {
    engine: "puppeteer",
    log: false,
    pageLimit: 5,
    waitUntil: "load",
  };

  return {
    browser: "chromium",
    internalLinks,
    externalLinks,
    scripts,
    techStack: {
      internal: internalTechStack,
      external: externalTechStack,
    },
    cookies,
    emailAddresses,
    pagesVisited: 0,
    pageTitle: "",
    pageDescription: "",
    redirectUrl: null,
    url: {
      href: "",
      origin: "",
      hostname: "",
      baseUrl: "",
    },
    options,
    browsers: {
      puppeteer: {
        browser: null,
        page: null,
      },
      playwright: {
        browser: null,
        page: null,
      },
    },
  };
}
