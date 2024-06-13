import { logging } from "./utils.js";
import { getErrorMessage } from "./utils.js";
import { addInternalLink, isInternalLink, isValidLink } from "./urls.js";

/**
 * @typedef {import('puppeteer').Page} Page
 * @typedef {import('./types').CollectedData} CollectedData
 * @typedef {import('./types').InternalLinksMap} InternalLinksMap
 * @typedef {import('./types').ScraperOptions} ScraperOptions
 */

/**
 * Searches for links from sitemap paths on a given page.
 * @param {object} params - Parameters containing the Puppeteer page, collected data, and scraper features.
 * @param {Page} params.page - The Puppeteer page object.
 * @param {CollectedData} params.data - The collected data.
 */
export async function getlinksFromSitemapSearch({ page, data }) {
  if (!data.options?.sitemapSearch) return;
  const url = data.url.origin;

  const sitemapPaths = [
    "sitemap.xml",
    "sitemap-index.xml",
    "sitemap.xml.gz",
    "sitemap1.xml",
    "sitemap2.xml",
    "sitemap3.xml",
    "sitemap_index.xml",
    "sitemap/",
    "sitemap/index.xml",
    "sitemap/sitemap.xml",
    "sitemap/sitemap1.xml",
    "sitemap/sitemap_index.xml",
    "rss.xml",
    "atom.xml",
    "feed/",
    "feed.xml",
    "blogs/feed.xml",
    "news/rss.xml",
  ];

  for (const path of sitemapPaths) {
    try {
      const sitemapUrl = new URL(`${url}/${path}`);
      const doesExist = await doesSitemapPageExist(sitemapUrl);
      if (doesExist) await addLinksFromSitemap(page, sitemapUrl, data);
    } catch (_error) {
      continue;
    }
  }
}

/**
 * Checks if a sitemap page exists.
 * @param {URL} url - The URL of the sitemap page.
 * @returns {Promise<boolean>} - True if the sitemap page exists, false otherwise.
 */
async function doesSitemapPageExist(url) {
  try {
    const response = await fetch(url, { redirect: "error" });
    if (response.status === 200) return true;
    return false;
  } catch (_error) {
    return false;
  }
}

/**
 * Retrieves links from a specific sitemap URL.
 * @param {object} params - Parameters containing the Puppeteer page, collected data, and scraper features.
 * @param {Page} params.page - The Puppeteer page object.
 * @param {CollectedData} params.data - The collected data.
 */
export async function getLinksFromSitemapUrl({ page, data }) {
  const url = data.options?.sitemapUrl;
  if (!url) return;
  const links = data.internalLinks;
  logging(`${url} - Internal Links before Sitemap: ${links.size}`);
  try {
    const sitemapUrl = new URL(url);
    await addLinksFromSitemap(page, sitemapUrl, data);
  } catch (error) {
    logging(
      `${url} - fn getLinksFromSitemapUrl error: ${getErrorMessage(error)}`
    );
  }
  logging(`${url} - Internal Links after Sitemap: ${links.size}`);
  return;
}

/**
 * Adds links from a sitemap URL to the internal links map.
 * @param {Page} page - The Puppeteer page object.
 * @param {URL} sitemapUrl - The sitemap URL.
 * @param {CollectedData} data - The collected data.
 */
async function addLinksFromSitemap(page, sitemapUrl, data) {
  try {
    const hrefs = await getLinksFromSitemapPage(page, sitemapUrl.href);

    for (const href of hrefs) {
      if (!isValidLink(href)) continue;
      const { hostname, origin, pathname, search } = new URL(href);
      const isInternal = isInternalLink({
        internalHostname: data.url.hostname,
        urlHostname: hostname,
        compareSubdomains: true,
      });
      if (!isInternal) continue;
      addInternalLink({ link: `${origin}${pathname}${search}`, data });
    }
  } catch (error) {
    logging(`Error processing sitemap links: ${getErrorMessage(error)}`);
  }
}

/**
 * Retrieves links from a sitemap page.
 * @param {Page} page - The Puppeteer page object.
 * @param {string} href - The href of the sitemap page.
 * @returns {Promise<string[]>} - An array of links retrieved from the sitemap page.
 */
async function getLinksFromSitemapPage(page, href) {
  try {
    await page.goto(href, { waitUntil: "load", timeout: 20000 });
    return await page.$$eval("a", (links) => links.map((link) => link.href));
  } catch (error) {
    logging(`Failed to get links from page: ${getErrorMessage(error)}`);
    return [];
  }
}

/**
 * Searches sitemaps for links based on the given features.
 * @param {object} params - Parameters containing the Puppeteer page, collected data, and scraper features.
 * @param {Page} params.page - The Puppeteer page object.
 * @param {CollectedData} params.data - The collected data.
 */
export async function searchSitemaps({ page, data }) {
  await getlinksFromSitemapSearch({ page, data });
  await getLinksFromSitemapUrl({ page, data });
}
