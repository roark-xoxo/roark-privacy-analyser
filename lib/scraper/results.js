import { getDomainName } from "./urls.js";
import { getPrivacyPageLinks } from "./meta.js";

/**
 * @typedef {import('./types').CollectedData} CollectedData
 * @typedef {import('./types').ScrapeResults} ScrapeResults
 * @typedef {import('./types').UrlsRecordFields} UrlsRecordFields
 * @typedef {import('./types').ExternalLinksMap} ExternalLinksMap
 * @typedef {import('./types').ScriptsRecordFields} ScriptsRecordFields
 */

/**
 * Updates the scraping results with the provided data.
 * @param {object} params - The parameters for the function.
 * @param {CollectedData} params.data - The collected data from scraping.
 * @param {ScrapeResults} params.results - The results object to be updated.
 * @since 1.0.0
 */
export function updateResults({ data, results }) {
  if (results.success !== false && hasStatus200(data) === false) {
    results.success = false;
    results.message = results.message
      ? results.message
      : "ERR_NO_200_STATUS_CODES";
  }
  results.success = results.success === false ? false : true;
  results.baseUrl = getDomainName(data.url.origin);
  results.cookies = Array.from(data.cookies.values());
  results.internalUrls = getVisitedUrls(data);
  results.externalUrls = getExternalUrls(data);
  results.internalTechStack = Array.from(data.techStack.internal);
  results.externalTechStack = Array.from(data.techStack.external);
  results.externalScripts = getScriptResults(data);
  results.emailAddresses = Array.from(data.emailAddresses);
  results.privacyPage = getPrivacyPageLinks(data);
  results.pageTitle = data.pageTitle;
  results.pageDescription = data.pageDescription;
  results.pagesVisited = data.pagesVisited;
  results.redirectUrl = data.redirectUrl;
  return;
}

/**
 * Checks if any of the internal links has a status of 200.
 * @since 1.0.0
 * @param {CollectedData} data - The collected data from scraping.
 * @returns {boolean} - Returns true if any internal link has status 200.
 */
const hasStatus200 = (data) => {
  for (const value of data.internalLinks.values()) {
    if (value.status === 200) {
      return true;
    }
  }
  return false;
};

/**
 * Gets the external URLs from the collected data.
 * @since 1.0.0
 * @param {CollectedData} data - The collected data.
 * @returns {UrlsRecordFields[]} - An array of URLs and their associated information.
 */
export const getExternalUrls = (data) => {
  return getLinks(data.externalLinks);
};

/**
 * Converts a map of external links to an array of URLs with associated information.
 * @since 1.0.0
 * @param {ExternalLinksMap} links - Map of external links.
 * @returns {UrlsRecordFields[]} - An array of URLs and their associated information.
 */
export const getLinks = (links) => {
  /** @type {UrlsRecordFields[]} */
  const urls = [];
  for (const url of links) {
    const key = url[0];
    const value = url[1];
    /** @type {UrlsRecordFields} */
    const fields = {
      Name: key,
      server: value?.server ?? null,
      setCookie: value?.setCookie ?? null,
      setCookieAlt: value?.setCookieAlt ?? null,
      poweredBy: value?.poweredBy ?? null,
      via: value?.via ?? null,
      akamaiCacheStatus: value?.akamaiCacheStatus ?? null,
      xCache: value?.xCache ?? null,
      xCacheAlt: value?.xCacheAlt ?? null,
      xAmzCfPop: value?.xAmzCfPop ?? null,
      xAmzRid: value?.xAmzRid ?? null,
    };
    urls.push(fields);
  }
  return urls;
};

/**
 * Retrieves all visited internal URLs from the collected data.
 * @since 1.0.0
 * @param {CollectedData} data - The collected data.
 * @returns {string[]} - An array of visited internal URLs.
 */
export const getVisitedUrls = (data) => {
  const { internalLinks } = data;
  /** @type {string[]} */
  const urls = [];
  for (const link of internalLinks.entries()) {
    if (link[1].visited === true) urls.push(link[0]);
  }
  return urls;
};

/**
 * Gathers information about external scripts from the collected data.
 * @since 1.0.0
 * @param {CollectedData} data - The collected data.
 * @returns {ScriptsRecordFields[]} - An array of script information objects.
 */
export const getScriptResults = (data) => {
  const scripts = [];
  for (const value of data.scripts.values()) {
    if (value.isExternal === true) {
      scripts.push({
        url: value.url,
        scriptname: value.scriptname,
        hostname: [value.hostname],
        pathname: value.pathname,
        server: value?.server ? [value?.server] : [],
      });
    }
  }
  return scripts;
};
