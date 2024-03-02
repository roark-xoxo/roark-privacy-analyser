import { delay, getErrorMessage } from "../helpers/validation.js";
import { usesCloudflareTurnstyle } from "./captcha.js";
import { getCookiesPlaywright, getCookiesPuppeteer } from "./cookies.js";
import { getEmailAddresses, getEmailAddressesPuppeteer } from "./email.js";
import {
  getCorrectHttpProtocol,
  isDomainError,
  isHttpsError,
  isPageRedirectError,
  isTimeoutErrror,
  isTurnstyleError,
} from "./errors.js";
import {
  clickElement,
  clickElementPuppeteer,
  scrollToPageEnd,
} from "./interactions.js";
import {
  getInternalLinksFromPlaywrightPage,
  getInternalLinksFromPagePuppeteer,
  hasVisitedLink,
} from "./urls.js";
import { getPageMeta, getPageMetaPuppeteer } from "./meta.js";
import { wasPageRedirected } from "./page.js";
import { updateScrapeStatusOnAirtable } from "../airtable/privacy-records.js";
import { logToFile } from "../helpers/utils.js";

/**
 * @typedef {import('./types').AirtableUpdateScraperArgs} AirtableUpdateScraperArgs
 * @typedef {import('./types').CollectedData} CollectedData
 * @typedef {import('./types').ExternalLinksMap} ExternalLinksMap
 * @typedef {import('./types').ScrapeResults} ScrapeResults
 * @typedef {import('./types').ScraperArgsFeaturesType} ScraperArgsFeaturesType
 * @typedef {import('./types').TechStack} TechStack
 * @typedef {import('./types').WaitUntilOptions} WaitUntilOptions
 * @typedef {import('./types').WaitUntilOptionsPlaywright} WaitUntilOptionsPlaywright
 * @typedef {import('./types').WaitUntilOptionsPuppeteer} WaitUntilOptionsPuppeteer
 * @typedef {import('puppeteer').Page} PagePuppeteer
 * @typedef {import('playwright').Page} PagePlaywright
 */

/**
 * Visits internal links using Playwright.
 * @param {object} params - Parameters containing page, data, features, results, and airtable.
 * @param {PagePlaywright} params.page - The Playwright page object.
 * @param {CollectedData} params.data - The collected data.
 * @param {ScraperArgsFeaturesType} params.features - The features for scraping.
 * @param {ScrapeResults} params.results - The scrape results.
 * @param {AirtableUpdateScraperArgs} [params.airtable] - Additional Airtable arguments.
 */
export async function visitInternalLinksPlaywright({
  page,
  data,
  features,
  results,
  airtable,
}) {
  const { internalLinks } = data;
  const { pageLimit, log } = features;

  for (const link of internalLinks) {
    if (hasVisitedLink(link)) continue;
    if (pageLimit === data.pagesVisited) break;
    data.pagesVisited++;

    try {
      await visitInternalLinkPlaywright({
        page,
        data,
        features,
        link: link[0],
      });

      const logMessage = `${data.pagesVisited} / ${pageLimit} / ${internalLinks.size} (PW) ${link[0]}`;

      if (data.pagesVisited % 5 === 0) {
        void updateScrapeStatusOnAirtable({
          airtable,
          message: logMessage,
        });
      }

      if (log) logToFile(logMessage);
    } catch (error) {
      const message = getErrorMessage(error);
      const logMessage = `${link[0]}: ${message} (fn ${visitInternalLinksPlaywright.name})`;
      if (log) logToFile(logMessage);
      void updateScrapeStatusOnAirtable({
        airtable,
        message: logMessage,
      });

      if (isTurnstyleError(error)) {
        results.message = message;
        break;
      }

      if (data.pagesVisited > 0) continue;

      if (isHttpsError(error)) {
        data.internalLinks.set(getCorrectHttpProtocol(link[0]), {
          visited: false,
        });
        continue;
      }
      results.success = false;
      if (isDomainError(error)) {
        results.message = message;
      } else if (isPageRedirectError(error)) {
        results.message = message;
      } else if (isTimeoutErrror(error)) {
        results.message = message;
      } else {
        results.message = message;
      }
      break;
    }
  }

  return;
}

/**
 * Visits a single internal link using Playwright.
 * @param {object} params - Parameters containing page, data, features, and link.
 * @param {PagePlaywright} params.page - The Playwright page object.
 * @param {CollectedData} params.data - The collected data.
 * @param {ScraperArgsFeaturesType} params.features - The features for scraping.
 * @param {string} params.link - The link to visit.
 */
async function visitInternalLinkPlaywright({ page, data, features, link }) {
  const { internalLinks } = data;
  const { emails, waitUntil, scroll } = features;
  const delayMs = features?.delay;

  internalLinks.set(link, { visited: true });
  /** @type {ExternalLinksMap} */
  const prevExternalLinks = new Map(data.externalLinks);
  /** @type {TechStack} */
  const prevTechStackInternal = new Set(data.techStack.internal);
  /** @type {TechStack} */
  const prevTechStackExternal = new Set(data.techStack.external);

  const response = await page.goto(link, {
    waitUntil: waitUntilPlaywrightOptionValidation(waitUntil),
    timeout: 30000,
  });

  internalLinks.set(link, {
    visited: true,
    status: response?.status(),
  });

  const wasRedirected = wasPageRedirected({
    pageUrl: page.url(),
    link,
    features,
    entryFunctionName: "fn_visitInternalLinkPlaywright",
  });

  if (wasRedirected) {
    data.externalLinks = prevExternalLinks;
    data.techStack.internal = prevTechStackInternal;
    data.techStack.external = prevTechStackExternal;
    if (data.pagesVisited === 0) {
      data.redirectUrl = page.url();
      throw new Error("ERROR: redirected on first page");
    } else return;
  }

  if (scroll) {
    await scrollToPageEnd(page);
  }

  await getCookiesPlaywright({ page, data });

  await getInternalLinksFromPlaywrightPage({
    page,
    data,
    features,
    link,
  });

  if (data.pagesVisited === 0) {
    await getPageMeta(page, data);
    await clickElement(page, features);
  }

  if (emails) await getEmailAddresses({ page, data });

  if (usesCloudflareTurnstyle(await page.content())) {
    data.usesCloudflareTurnstyle = true;
    throw new Error("ERROR: uses cloudflare turnstyle");
  }

  await delay(delayMs ?? 300);
  return;
}

/**
 * Visits internal links using Puppeteer.
 * @param {object} params - Parameters containing page, data, features, results, and airtable.
 * @param {PagePuppeteer} params.page - The Puppeteer page object.
 * @param {CollectedData} params.data - The collected data.
 * @param {ScraperArgsFeaturesType} params.features - The features for scraping.
 * @param {ScrapeResults} params.results - The scrape results.
 * @param {AirtableUpdateScraperArgs|undefined} [params.airtable] - Additional Airtable arguments.
 */
export async function visitInternalLinksPuppeteer({
  page,
  data,
  features,
  results,
  airtable,
}) {
  const { internalLinks } = data;
  const { pageLimit, log } = features;

  for (const link of internalLinks) {
    if (hasVisitedLink(link)) continue;
    if (pageLimit === data.pagesVisited) break;
    data.pagesVisited++;

    try {
      await visitInternalLinkPuppeteer({ page, data, features, link: link[0] });

      const logMessage = `${data.pagesVisited} / ${pageLimit} / ${internalLinks.size} (PP) ${link[0]}`;

      if (data.pagesVisited % 5 === 0) {
        void updateScrapeStatusOnAirtable({
          airtable,
          message: logMessage,
        });
      }

      if (log) logToFile(logMessage);
    } catch (error) {
      const message = getErrorMessage(error);
      const logMessage = `${link[0]}: ${message} (fn ${visitInternalLinksPuppeteer.name})`;

      if (log) logToFile(logMessage);

      void updateScrapeStatusOnAirtable({
        airtable,
        message: logMessage,
      });

      if (isTurnstyleError(error)) {
        results.message = message;
        break;
      }

      if (data.pagesVisited > 0) continue;

      if (isHttpsError(error)) {
        data.internalLinks.set(getCorrectHttpProtocol(link[0]), {
          visited: false,
        });
        continue;
      }
      results.success = false;
      if (isDomainError(error)) {
        results.message = message;
      } else if (isPageRedirectError(error)) {
        results.message = message;
      } else if (isTimeoutErrror(error)) {
        results.message = message;
      } else {
        results.message = message;
      }
      break;
    }
  }
  return;
}

/**
 * Visits a single internal link using Puppeteer.
 * @since 1.0.0
 * @param {object} params - Parameters containing page, data, features, and link.
 * @param {PagePuppeteer} params.page - The Puppeteer page object.
 * @param {CollectedData} params.data - The collected data.
 * @param {ScraperArgsFeaturesType} params.features - The features for scraping.
 * @param {string} params.link - The link to visit.
 */
async function visitInternalLinkPuppeteer({ page, data, features, link }) {
  const { internalLinks } = data;
  const { emails, waitUntil } = features;
  const delayMs = features?.delay;

  internalLinks.set(link, { visited: true });
  /** @type {ExternalLinksMap} */
  const prevExternalLinks = new Map(data.externalLinks);
  /** @type {TechStack} */
  const prevTechStackInternal = new Set(data.techStack.internal);
  /** @type {TechStack} */
  const prevTechStackExternal = new Set(data.techStack.external);

  const response = await page.goto(link, {
    waitUntil: waitUntilPuppeteerOptionValidation(waitUntil),
    timeout: 30000,
  });
  internalLinks.set(link, {
    visited: true,
    status: response?.status(),
  });

  const wasRedirected = wasPageRedirected({
    pageUrl: page.url(),
    link,
    features,
    entryFunctionName: "fn_visitInternalLinkPuppeteer",
  });

  if (wasRedirected) {
    data.externalLinks = prevExternalLinks;
    data.techStack.internal = prevTechStackInternal;
    data.techStack.external = prevTechStackExternal;
    if (data.pagesVisited === 0) {
      data.redirectUrl = page.url();
      throw new Error("ERROR: redirected on first page");
    } else return;
  }

  await getInternalLinksFromPagePuppeteer({
    page,
    data,
    features,
    link,
  });

  await getCookiesPuppeteer({ page, data });

  if (data.pagesVisited === 0) {
    await getPageMetaPuppeteer(page, data);
    await clickElementPuppeteer(page, features);
  }

  if (emails) await getEmailAddressesPuppeteer({ page, data });

  if (usesCloudflareTurnstyle(await page.content())) {
    data.usesCloudflareTurnstyle = true;
    throw new Error("ERROR: uses cloudflare turnstyle");
  }

  await delay(delayMs ?? 300);
  return;
}

/**
 * Validates and returns the correct waitUntil option for Playwright.
 * @param {WaitUntilOptions} waitUntil - The waitUntil option.
 * @returns {WaitUntilOptionsPlaywright} - The validated waitUntil option for Playwright.
 */
function waitUntilPlaywrightOptionValidation(waitUntil) {
  if (waitUntil === "domcontentloaded") return "domcontentloaded";
  if (waitUntil === "load") return "load";
  return "networkidle";
}

/**
 * Validates and returns the correct waitUntil option for Puppeteer.
 * @param {WaitUntilOptions} waitUntil - The waitUntil option.
 * @returns {WaitUntilOptionsPuppeteer} - The validated waitUntil option for Puppeteer.
 */
function waitUntilPuppeteerOptionValidation(waitUntil) {
  if (waitUntil === "domcontentloaded") return "domcontentloaded";
  if (waitUntil === "networkidle0") return "networkidle0";
  if (waitUntil === "networkidle") return "networkidle2";
  if (waitUntil === "load") return "load";
  return "networkidle2";
}
