import { logging } from "./utils.js";
import { getErrorMessage } from "./utils.js";
import { isValidLink } from "./urls.js";

/**
 * @typedef {import('puppeteer').Page} Page
 * @typedef {import('./types').CollectedData} CollectedData
 * @typedef {import('./types').InternalLinksMap} InternalLinksMap
 * @typedef {import('./types').ScraperOptions} ScraperOptions
 */

/**
 * Searches for links from sitemap paths on a given page.
 * @param {Page} page - The Puppeteer page object.
 * @param {string} url - The base URL.
 * @param {InternalLinksMap} links - The map of internal links.
 */
export async function getlinksFromSitemapSearch(page, url, links) {
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
      if (doesExist) await addLinksFromSitemap(page, sitemapUrl, links, url);
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
 * @param {Page} page - The Puppeteer page object.
 * @param {string} url - The sitemap URL.
 * @param {InternalLinksMap} links - The map of internal links.
 * @param {string} origin - The origin of the base URL.
 */
export async function getLinksFromSitemapUrl(page, url, links, origin) {
  logging(url, "Internal Links before Sitemap:", links.size);
  try {
    const sitemapUrl = new URL(url);
    await addLinksFromSitemap(page, sitemapUrl, links, origin);
  } catch (_err) {
    logging(url, "fn_getLinksFromSitemapUrl", _err);
  }
  logging(url, "Internal Links after Sitemap:", links.size);
  return;
}

/**
 * Adds links from a sitemap URL to the internal links map.
 * @param {Page} page - The Puppeteer page object.
 * @param {URL} url - The sitemap URL.
 * @param {InternalLinksMap} links - The map of internal links.
 * @param {string} origin - The origin of the base URL.
 */
async function addLinksFromSitemap(page, url, links, origin) {
  try {
    const hrefs = await getLinksFromSitemapPage(page, url.href);

    hrefs.forEach((href) => {
      if (isValidLink(href)) {
        const hrefUrl = new URL(href);
        const fullUrl = hrefUrl.origin + hrefUrl.pathname;
        if (hrefUrl.origin === origin && !links.has(fullUrl)) {
          links.set(fullUrl, { visited: false });
        }
      }
    });
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    logging(`Error processing sitemap links: ${errorMessage}`);
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
    await page.goto(href, { waitUntil: "load", timeout: 2000 });
    return await page.$$eval("a", (links) => links.map((link) => link.href));
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    logging(`Failed to get links from page: ${errorMessage}`);
    return [];
  }
}

/**
 * Searches sitemaps for links based on the given features.
 * @param {object} params - Parameters containing the Puppeteer page, collected data, and scraper features.
 * @param {Page} params.page - The Puppeteer page object.
 * @param {CollectedData} params.data - The collected data.
 * @param {ScraperOptions} params.options - The features for scraping.
 */
export async function searchSitemaps({ page, data, options }) {
  if (options?.sitemapSearch) {
    await getlinksFromSitemapSearch(page, data.url.origin, data.internalLinks);
  }

  if (options?.sitemapUrl)
    await getLinksFromSitemapUrl(
      page,
      options?.sitemapUrl,
      data.internalLinks,
      data.url.origin
    );
}
