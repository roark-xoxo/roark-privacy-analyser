import { delay, getErrorMessage } from "./utils.js";
import { usesCloudflareTurnstyle } from "./captcha.js";
import { getCookiesPlaywright, getCookiesPuppeteer } from "./cookies.js";
import { addEmailAddresses } from "./email.js";
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
import { logging } from "./utils.js";
import { getPagePuppeteer, getPuppeteerBrowser } from "./browser.js";

/**
 * @typedef {import('./types').CollectedData} CollectedData
 * @typedef {import('./types').CookiesMap} CookiesMap
 * @typedef {import('./types').ExternalLinksMap} ExternalLinksMap
 * @typedef {import('./types').ScrapeResults} ScrapeResults
 * @typedef {import('./types').ScraperOptions} ScraperOptions
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
 * @param {CollectedData} params.data - The collected data.
 * @param {ScrapeResults} params.results - The scrape results.
 */
export async function visitInternalLinksPlaywright({ data, results }) {
  const { internalLinks, options } = data;
  const { pageLimit } = options;

  for (const link of internalLinks) {
    if (hasVisitedLink(link)) continue;
    if (pageLimit === data.pagesVisited) break;
    data.pagesVisited++;

    try {
      await visitInternalLinkPlaywright({
        data,
        link: link[0],
      });

      logging(
        `${data.pagesVisited} / ${pageLimit} / ${internalLinks.size} (PW) ${link[0]}`
      );
    } catch (error) {
      const message = getErrorMessage(error);
      logging(
        `${link[0]}: ${message} (fn ${visitInternalLinksPlaywright.name})`
      );

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
 * @param {CollectedData} params.data - The collected data.
 * @param {string} params.link - The link to visit.
 */
async function visitInternalLinkPlaywright({ data, link }) {
  const { internalLinks, options } = data;
  const { emails, waitUntil, scroll } = options;
  const delayMs = options?.delay;
  const page = data.browsers.playwright.page;
  if (!page) return;

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
    options,
    entryFunctionName: "fn_visitInternalLinkPlaywright",
  });

  if (wasRedirected) {
    data.externalLinks = prevExternalLinks;
    data.techStack.internal = prevTechStackInternal;
    data.techStack.external = prevTechStackExternal;
    if (data.pagesVisited === 1) {
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
    link,
  });

  if (data.pagesVisited === 1) {
    await getPageMeta(page, data);
    await clickElement(page, options);
  }

  if (emails) addEmailAddresses({ html: await page.content(), data });

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
 * @param {CollectedData} params.data - The collected data.
 * @param {ScrapeResults} params.results - The scrape results.
 */
export async function visitInternalLinksPuppeteer({ data, results }) {
  const { internalLinks, options } = data;
  const { pageLimit } = options;

  for (const link of internalLinks) {
    if (hasVisitedLink(link)) continue;
    if (pageLimit === data.pagesVisited) break;
    data.pagesVisited++;

    try {
      await visitInternalLinkPuppeteer({
        data,
        link: link[0],
      });

      logging(
        `${data.pagesVisited} / ${pageLimit} / ${internalLinks.size} (PP) ${link[0]}`
      );
    } catch (error) {
      const message = getErrorMessage(error);
      logging(
        `${link[0]}: ${message} (fn ${visitInternalLinksPuppeteer.name})`
      );

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
 * @since 0.1.0
 * @param {object} params - Parameters containing page, data, features, and link.
 * @param {CollectedData} params.data - The collected data.
 * @param {string} params.link - The link to visit.
 */
async function visitInternalLinkPuppeteer({ data, link }) {
  const { internalLinks, options } = data;
  const { emails, waitUntil } = options;
  const delayMs = options?.delay;
  const page = data.browsers.puppeteer.page;
  if (!page) return;

  internalLinks.set(link, { visited: true });
  /** @type {CookiesMap} */
  const prevCookies = new Map(data.cookies);
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
    options,
    entryFunctionName: "fn_visitInternalLinkPuppeteer",
  });
  if (wasRedirected) {
    data.cookies = prevCookies;
    data.externalLinks = prevExternalLinks;
    data.techStack.internal = prevTechStackInternal;
    data.techStack.external = prevTechStackExternal;
    const oldBrowser = data.browsers.puppeteer.browser;
    if (oldBrowser) {
      await oldBrowser.close();
    }

    const { browser } = await getPuppeteerBrowser(true);
    if (!browser) throw new Error("Couldn't reopen browser.");
    data.browsers.puppeteer.browser = browser;
    const page = await getPagePuppeteer({ browser, data });
    data.browsers.puppeteer.page = page;
    if (!page) throw new Error("Couldn't reopen page.");
    if (data.pagesVisited === 1) {
      data.redirectUrl = data.browsers.puppeteer.page.url();
      throw new Error("ERROR: redirected on first page");
    }
    return;
  }

  await getInternalLinksFromPagePuppeteer({
    data,
    link,
  });

  await getCookiesPuppeteer({ page, data });

  if (data.pagesVisited === 1) {
    await getPageMetaPuppeteer(page, data);
    await clickElementPuppeteer(page, options);
  }

  if (emails) addEmailAddresses({ html: await page.content(), data });

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
