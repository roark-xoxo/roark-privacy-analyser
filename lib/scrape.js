/**
 * @typedef {import('./types').CollectedData} CollectedData
 * @typedef {import('./types').ResultProps} ResultProps
 * @typedef {import('./types').ScrapeResults} ScrapeResults
 * @typedef {import('./types').ScraperArgs} ScraperArgs
 * @typedef {import('./types').ScraperOptions} ScraperOptions
 * @typedef {import('./types').ScraperReturnObject} ScraperReturnObject
 */

import { mergeCookieMaps } from "./cookies.js";
import { getPrivacyPageLinks } from "./meta.js";
import {
  getExternalUrls,
  getScriptResults,
  getVisitedUrls,
} from "./results.js";
import { getScrapeResultsPlaywright } from "./scrape-playwright.js";
import { getScrapeResultsPuppeteer } from "./scrape-puppeteer.js";

import { getDomainName } from "./urls.js";
import { logging, mergeMaps, mergeSets } from "./utils.js";
import { normalizeOptions } from "./validation.js";

/**
 * Runs the scraper based on provided arguments.
 * @param {any} url - Arguments for the scraper.
 * @param {any} options - Arguments for the scraper.
 * @returns {Promise<ScraperReturnObject>} - The results of the scraping process.
 */
export function getScrapeResults(url, options = undefined) {
  if (!url || typeof url !== "string" || !url.trim()) {
    throw new Error("No URL provided");
  }
  process.on("unhandledRejection", function (reason) {
    const details = `Reason: ${
      reason instanceof Error ? reason.message : JSON.stringify(reason)
    }`;
    logging(`Unhandled Rejection at: ${url}. Details: ${details}`);
  });
  const validatedOptions = normalizeOptions(options);
  return runScraper({ url, options: validatedOptions });
}

/**
 * Executes the scraping process.
 * @param {ScraperArgs} args - The scraper arguments.
 * @returns {Promise<ScraperReturnObject>} - The scraping results.
 */
async function runScraper(args) {
  if (args.options.engine === "puppeteer") {
    return getScrapeResultsPuppeteer(args);
  } else if (args.options.engine === "both") {
    return combineResults({
      resultsPuppeteer: await getScrapeResultsPuppeteer(args),
      resultsPlaywright: await getScrapeResultsPlaywright(args),
    });
  }
  return getScrapeResultsPlaywright(args);
}

/**
 * Combines the results from Puppeteer and Playwright scrapers.
 * @param {ResultProps} props - The results from Puppeteer and Playwright.
 * @returns {Promise<ScraperReturnObject>} - Combined scraping results.
 */
async function combineResults(props) {
  const { resultsPuppeteer, resultsPlaywright } = props;
  const combinedCollectedData = combineCollectedData({
    resultsPuppeteer,
    resultsPlaywright,
  });
  const combinedResults = combinedResultsData({
    data: combinedCollectedData,
    results: { resultsPuppeteer, resultsPlaywright },
  });
  return {
    collectedData: combinedCollectedData,
    results: combinedResults,
  };
}

/**
 * Combines results data from two different scraping sources.
 * @param {object} params - Parameters containing data and results.
 * @param {CollectedData} params.data - The collected data.
 * @param {ResultProps} params.results - Results from Puppeteer and Playwright.
 * @returns {ScrapeResults} - The combined scraping results.
 */
function combinedResultsData({ data, results }) {
  let success = true;
  if (
    results.resultsPlaywright.results.success === false &&
    results.resultsPuppeteer.results.success === false
  ) {
    success = false;
  }
  return {
    success,
    url: data.url,
    baseUrl: getDomainName(data.url.origin),
    cookies: Array.from(data.cookies.values()),
    internalUrls: getVisitedUrls(data),
    externalUrls: getExternalUrls(data),
    internalTechStack: Array.from(data.techStack.internal),
    externalTechStack: Array.from(data.techStack.external),
    externalScripts: getScriptResults(data),
    emailAddresses: Array.from(data.emailAddresses),
    privacyPage: getPrivacyPageLinks(data),
    pageTitle: data.pageTitle,
    pageDescription: data.pageDescription,
    pagesVisited:
      results.resultsPlaywright.results.pagesVisited >=
      results.resultsPuppeteer.results.pagesVisited
        ? results.resultsPlaywright.results.pagesVisited
        : results.resultsPuppeteer.results.pagesVisited,
    redirectUrl: data.redirectUrl,
    scrapeTime:
      results.resultsPuppeteer.results.scrapeTime +
      results.resultsPlaywright.results.scrapeTime,
    message: results.resultsPuppeteer.results.message,
    status: results.resultsPuppeteer.results.status,
    records: {
      urls: null,
      cookies: null,
    },
  };
}

/**
 * Combines collected data from Puppeteer and Playwright scrapers.
 * @param {ResultProps} params - Parameters containing results from Puppeteer and Playwright.
 * @returns {CollectedData} - The combined collected data.
 */
function combineCollectedData({ resultsPuppeteer, resultsPlaywright }) {
  const dataPuppeteer = resultsPuppeteer.collectedData;
  const dataPlaywright = resultsPlaywright.collectedData;
  return {
    browser: dataPlaywright.browser,
    browsers: dataPlaywright.browsers,
    options: dataPlaywright.options,
    internalLinks: mergeMaps(
      dataPlaywright.internalLinks,
      dataPuppeteer.internalLinks
    ),
    externalLinks: mergeMaps(
      dataPlaywright.externalLinks,
      dataPuppeteer.externalLinks
    ),
    scripts: mergeMaps(dataPlaywright.scripts, dataPuppeteer.scripts),
    techStack: {
      internal: mergeSets(
        dataPlaywright.techStack.internal,
        dataPuppeteer.techStack.internal
      ),
      external: mergeSets(
        dataPlaywright.techStack.external,
        dataPuppeteer.techStack.external
      ),
    },
    cookies: mergeCookieMaps(dataPlaywright.cookies, dataPuppeteer.cookies),
    emailAddresses: mergeSets(
      dataPlaywright.emailAddresses,
      dataPuppeteer.emailAddresses
    ),
    pagesVisited: dataPlaywright.pagesVisited + dataPuppeteer.pagesVisited,
    pageTitle: dataPuppeteer.pageTitle,
    pageDescription: dataPuppeteer.pageDescription,
    redirectUrl: dataPuppeteer.redirectUrl,
    usesCloudflareTurnstyle: dataPlaywright.usesCloudflareTurnstyle,
    url: {
      href: dataPuppeteer.url.href,
      origin: dataPuppeteer.url.origin,
      hostname: dataPuppeteer.url.hostname,
      baseUrl: dataPuppeteer.url.baseUrl,
    },
  };
}
