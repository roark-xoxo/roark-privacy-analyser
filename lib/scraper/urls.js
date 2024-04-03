import { logToFile } from "../helpers/utils.js";
import {
  getErrorMessage,
  getInvalidExtensions,
} from "../helpers/validation.js";

/**
 * @typedef {import('./types').CollectedData} CollectedData
 * @typedef {import('./types').ExternalLinksMap} ExternalLinksMap
 * @typedef {import('./types').InternalLinksStatus} InternalLinksStatus
 * @typedef {import('./types').RequestOrResponseHeaders} RequestOrResponseHeaders
 * @typedef {import('./types').ResponseHeaders} ResponseHeaders
 * @typedef {import('./types').ScraperOptions} ScraperArgsFeaturesType
 * @typedef {import('./types').TechStack} TechStack
 * @typedef {import('puppeteer').Page} PagePuppeteer
 * @typedef {import('playwright').Page} PagePlaywright
 */

import { ParseResultType, parseDomain } from "parse-domain";

/**
 * Generates a valid URL object from a given string.
 * @param {string} url - The URL string to be validated.
 * @returns {URL} - The validated URL object.
 */
export function getValidUrlObject(url) {
  const urlString = getValidUrlString(url.trim());
  return new URL(urlString);
}

/**
 * Ensures the URL string has a valid protocol.
 * @param {string} url - The URL string to be validated.
 * @returns {string} - The URL string with a valid protocol.
 */
function getValidUrlString(url) {
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("www.")) return url.replace("www.", "http://");
  return "http://" + url;
}

/**
 * Determines if a link is internal.
 * @param {object} params - Parameters containing internal and URL hostnames, and a flag to compare subdomains.
 * @param {string} params.internalHostname - The hostname of the internal link.
 * @param {string} params.urlHostname - The hostname of the URL being checked.
 * @param {boolean} params.compareSubdomains - Whether to compare subdomains or not.
 * @returns {boolean} - True if the link is internal, false otherwise.
 */
export function isInternalLink({
  internalHostname,
  urlHostname,
  compareSubdomains,
}) {
  if (!internalHostname || !urlHostname) {
    throw new Error(`no hostname given (fn_${isInternalLink.name})`);
  }

  if (compareSubdomains) {
    return compareSubDomains(internalHostname, urlHostname);
  } else {
    return compareDomains(internalHostname, urlHostname);
  }
}

/**
 * Compares two domains to determine if they are the same.
 * @param {string} domain1 - The first domain to compare.
 * @param {string} domain2 - The second domain to compare.
 * @returns {boolean} - True if the domains are the same, false otherwise.
 */
export function compareDomains(domain1, domain2) {
  const parsedDomain1 = parseDomain(domain1);
  const parsedDomain2 = parseDomain(domain2);

  if (
    parsedDomain1.type === ParseResultType.Listed &&
    parsedDomain2.type === ParseResultType.Listed
  ) {
    if (parsedDomain1.topLevelDomains[0] !== parsedDomain2.topLevelDomains[0]) {
      return false;
    }
    if (parsedDomain1.domain === parsedDomain2.domain) {
      return true;
    }
  }
  return false;
}

/**
 * Compares two subdomains to determine if they are the same.
 * @param {string} domain1 - The first subdomain to compare.
 * @param {string} domain2 - The second subdomain to compare.
 * @returns {boolean} - True if the subdomains are the same, false otherwise.
 */
export function compareSubDomains(domain1, domain2) {
  const parsedDomain1 = parseDomain(domain1);
  const parsedDomain2 = parseDomain(domain2);

  if (
    parsedDomain1.type === ParseResultType.Listed &&
    parsedDomain2.type === ParseResultType.Listed
  ) {
    const subDomains1 = parsedDomain1.subDomains.filter(
      (subDomain) => subDomain !== "www"
    );
    const subDomains2 = parsedDomain2.subDomains.filter(
      (subDomain) => subDomain !== "www"
    );

    if (parsedDomain1.topLevelDomains[0] !== parsedDomain2.topLevelDomains[0]) {
      return false;
    }

    if (
      parsedDomain1.domain === parsedDomain2.domain &&
      JSON.stringify(subDomains1) === JSON.stringify(subDomains2)
    ) {
      return true;
    }
  }
  return false;
}

/**
 * Retrieves the domain name from a given URL.
 * @param {string} url - The URL string.
 * @returns {string} - The domain name extracted from the URL.
 */
export function getDomainName(url) {
  try {
    const urlObject = new URL(url);
    return urlObject.host.replace("www.", "");
  } catch (_error) {
    return "";
  }
}

/**
 * Adds URL data to the collected data object.
 * @param {object} params - Parameters containing the URL and the data object.
 * @param {string} params.url - The URL string.
 * @param {CollectedData} params.data - The collected data object.
 */
export function addUrlData({ url, data }) {
  const urlObject = getValidUrlObject(url);
  const baseUrl = new URL("/", urlObject.origin);

  data.url = {
    href: urlObject.href,
    origin: baseUrl.origin,
    hostname: baseUrl.hostname,
    baseUrl: getDomainName(baseUrl.origin),
  };
  const { internalLinks } = data;
  internalLinks.set(urlObject.href, { visited: false });
  internalLinks.set(`${baseUrl.origin}/`, { visited: false });
  return;
}

/**
 * Extracts the script name from a URL.
 * @param {string} string - The URL string.
 * @returns {string|undefined} - The script name extracted from the URL.
 */
const getScriptnameFromUrl = (string) => {
  return string.split("/").pop();
};

/**
 * Checks if a link has been visited.
 * @param {[string, InternalLinksStatus]} link - The link and its status.
 * @returns {boolean} - True if the link has been visited, false otherwise.
 */
export function hasVisitedLink(link) {
  return link[1].visited === true;
}

/**
 * Retrieves internal links from a Playwright page.
 * @param {object} params - Parameters containing the Playwright page, data, features, and link.
 * @param {PagePlaywright} params.page - The Playwright page object.
 * @param {CollectedData} params.data - The collected data.
 * @param {ScraperArgsFeaturesType} params.features - The features for scraping.
 * @param {string} params.link - The link to check.
 */
export async function getInternalLinksFromPlaywrightPage({
  page,
  data,
  features,
  link,
}) {
  const { log } = features;

  try {
    const siteLinks = await page.$$eval("a", (links) =>
      links.map((link) => link.href)
    );
    for (const siteLink of siteLinks) {
      try {
        if (!isValidLink(siteLink)) continue;
        const { hostname, origin, pathname, search } = new URL(siteLink);
        const isInternal = isInternalLink({
          internalHostname: data.url.hostname,
          urlHostname: hostname,
          compareSubdomains: true,
        });
        if (!isInternal) {
          continue;
        }
        addInternalLink({ link: `${origin}${pathname}${search}`, data });
      } catch (error) {
        if (log) {
          const errorMessage = getErrorMessage(error);
          logToFile(link, `Error processing link: ${errorMessage}`);
        }
      }
    }
  } catch (error) {
    if (log) {
      const errorMessage = getErrorMessage(error);
      logToFile(link, `Failed to get internal links: ${errorMessage}`);
    }
  }
  return;
}

/**
 * Validates if a URL is valid.
 * @param {string} href - The URL string to validate.
 * @returns {boolean} - True if the URL is valid, false otherwise.
 */
export function isValidUrl(href) {
  try {
    const url = new URL(href);
    if (!isCorrectProtocol(url)) return false;
    return true;
  } catch (_error) {
    return false;
  }
}

/**
 * Validates if a link is valid.
 * @param {string} href - The link to validate.
 * @returns {boolean} - True if the link is valid, false otherwise.
 */
export function isValidLink(href) {
  try {
    const url = new URL(href);

    if (
      !isCorrectProtocol(url) ||
      getInvalidExtensions().some((ext) =>
        url.pathname.toLowerCase().includes(ext)
      )
    ) {
      return false;
    }

    return true;
  } catch (_error) {
    return false;
  }
}

/**
 * Checks if the URL uses the correct protocol.
 * @param {URL} url - The URL object to check.
 * @returns {boolean} - True if the protocol is correct, false otherwise.
 */
const isCorrectProtocol = (url) => {
  if (url.protocol !== "https:" && url.protocol !== "http:") return false;
  return true;
};

/**
 * Retrieves and processes external URL information.
 * @param {object} params - Parameters including data, URL, headers, and page.
 * @param {CollectedData} params.data - The collected data.
 * @param {URL} params.url - The URL to process.
 * @param {RequestOrResponseHeaders} params.headers - The HTTP headers associated with the URL.
 * @param {PagePlaywright | PagePuppeteer} params.page - The current page object.
 */
export function getExternalUrlInfos({ data, url, headers, page }) {
  const externalLinks = data.externalLinks;
  const pageUrl = new URL(page.url());
  const pageFullUrl = pageUrl.origin + pageUrl.pathname;
  let { hostname } = url;
  if (hostname.startsWith("www.")) {
    hostname = hostname.slice(4);
  }
  if (hostname.startsWith(".")) {
    hostname = hostname.slice(1);
  }
  if (hostname.includes("d-") && hostname.includes(".ampproject.net")) {
    hostname = "d-*.ampproject.net";
  } else if (hostname.includes(".cloudfront.net")) {
    hostname = "*.cloudfront.net";
  } else if (
    hostname.includes("---") &&
    hostname.endsWith(".googlevideo.com")
  ) {
    hostname = "*---*-*.googlevideo.com";
  } else if (hostname.endsWith(".safeframe.googlesyndication.com")) {
    hostname = "*.safeframe.googlesyndication.com";
  } else if (hostname.endsWith("atari-embeds.googleusercontent.com")) {
    hostname = "*-atari-embeds.googleusercontent.com";
  } else if (
    hostname.startsWith("lh") &&
    hostname.endsWith("googleusercontent.com")
  ) {
    hostname = "lh*.googleusercontent.com";
  } else if (hostname.includes("linkedin.com") && hostname.startsWith("px.")) {
    hostname = "px.ads.linkedin.com";
  } else if (hostname.includes(".tile.openstreetmap.")) {
    hostname = "tile.openstreetmap.org";
  } else if (hostname.endsWith("wixsite.com")) {
    hostname = "wixsite.com";
  } else if (
    hostname.includes(".openstreetmap.") &&
    hostname.startsWith("tile")
  ) {
    hostname = "tile.openstreetmap.org";
  } else if (
    hostname.includes("facebook.com") &&
    hostname.startsWith("static")
  ) {
    hostname = "static*.facebook.com";
  } else if (
    hostname.includes(".fbcdn.net") &&
    hostname.startsWith("external")
  ) {
    hostname = "external-*.fbcdn.net";
  } else if (hostname.includes(".fbcdn.net") && hostname.startsWith("static")) {
    hostname = "static.*.fbcdn.net";
  } else if (hostname.includes(".fbcdn.net") && hostname.includes("scontent")) {
    hostname = "scontent-*-*.*.fbcdn.net";
  } else if (hostname.includes(".fbcdn.net") && hostname.includes("video")) {
    hostname = "video-*-*.*.fbcdn.net";
  } else if (
    hostname.includes("cdninstagram.com") &&
    hostname.includes("scontent")
  ) {
    hostname = "scontent-*-*.cdninstagram.com";
  } else if (
    hostname.includes("cdninstagram.com") &&
    hostname.includes("video")
  ) {
    hostname = "video-*-*.cdninstagram.com";
  } else if (hostname.includes("wix-engage-visitors-prod-")) {
    hostname = "wix-engage-visitors-prod-*.firebaseio.com";
  } else if (
    hostname.includes(".matomo.cloud") &&
    hostname !== "cdn.matomo.cloud"
  ) {
    hostname = "*.matomo.cloud";
  } else if (hostname.endsWith(".typeform.com")) {
    hostname = "*.typeform.com";
  } else if (hostname.endsWith(".akamaihd.net")) {
    hostname = "*.akamaihd.net";
  } else if (hostname.endsWith("s3.amazonaws.com")) {
    hostname = "s3.amazonaws.com";
  } else if (hostname.endsWith(".amazonaws.com")) {
    hostname = "*.*.amazonaws.com";
  } else if (hostname.endsWith(".fls.doubleclick.net")) {
    hostname = "*.fls.doubleclick.net";
  } else if (
    hostname.startsWith("googleads") &&
    hostname.endsWith("g.doubleclick.net")
  ) {
    hostname = "googleads.g.doubleclick.net";
  } else if (
    hostname.startsWith("clients") &&
    hostname.endsWith("google.com")
  ) {
    hostname = "clients*.google.com";
  } else if (hostname.endsWith("akstat.io")) {
    hostname = "akstat.io";
  } else if (hostname.endsWith(".azureedge.net")) {
    hostname = "*.azureedge.net";
  } else if (hostname.endsWith(".akamaized.net")) {
    hostname = "*.akamaized.net";
  } else if (hostname.endsWith(".nuid.nmrodam.com")) {
    hostname = "*.nuid.nmrodam.com";
  } else if (hostname.endsWith(".trk.sensic.net")) {
    hostname = "*.trk.sensic.net";
  } else if (hostname.endsWith(".gstatic.com") && hostname.startsWith("t")) {
    hostname = "t*.gstatic.com";
  } else if (
    hostname.endsWith(".gstatic.com") &&
    hostname.startsWith("encrypted")
  ) {
    hostname = "encrypted-*.gstatic.com";
  }

  if (externalLinks.has(hostname)) {
    const existingUrl = externalLinks.get(hostname);
    if (!existingUrl) return;
    const urlSet = new Set(existingUrl.foundOnUrls);
    urlSet.add(pageFullUrl);
    existingUrl.foundOnUrls = [...urlSet];
  } else {
    externalLinks.set(hostname, {
      server: headers?.server,
      setCookie: headers?.["set-cookie"],
      setCookieAlt: headers?.["Set-Cookie"],
      poweredBy: headers?.["x-powered-by"],
      via: headers?.["Via"] ?? headers?.["via"],
      akamaiCacheStatus: headers?.["Akamai-Cache-Status"],
      xCache: headers?.["X-Cache"],
      xCacheAlt: headers?.["x-cache"],
      xAmzCfPop: headers?.["x-amz-cf-pop"],
      xAmzRid: headers?.["x-amz-rid"],
      firstAddedOnPageNumber: data.pagesVisited + 1,
      foundOnUrls: [pageFullUrl],
    });
  }
  return;
}

/**
 * Identifies and adds a service based on the JavaScript filename in the URL.
 * @param {URL} url - The URL containing the script name.
 * @param {TechStack} data - The tech stack data to update.
 */
export function addServiceFromJsFilename(url, data) {
  const scriptname = getScriptnameFromUrl(url.pathname) ?? "";
  if (scriptname.includes("matomo.js") || scriptname.includes("piwik.js")) {
    data.add("matomo");
  }
  if (scriptname.includes("recaptcha__")) {
    data.add("Google reCAPTCHA");
  }
  if (
    scriptname.includes("cast_framework.js") ||
    scriptname.includes("cast_sender.js")
  ) {
    data.add("Google Cast");
  }
}

/**
 * Retrieves internal links from a Puppeteer page.
 * @param {object} params - Parameters containing the Puppeteer page, data, features, and link.
 * @param {PagePuppeteer} params.page - The Puppeteer page object.
 * @param {CollectedData} params.data - The collected data.
 * @param {ScraperArgsFeaturesType} params.features - The features for scraping.
 * @param {string} params.link - The link to check.
 */
export async function getInternalLinksFromPagePuppeteer({
  page,
  data,
  features,
  link,
}) {
  const { log } = features;

  try {
    const siteLinks = await page.$$eval("a", (links) =>
      links.map((link) => link.href)
    );
    for (const siteLink of siteLinks) {
      try {
        if (!isValidLink(siteLink)) continue;
        const { hostname, origin, pathname, search } = new URL(siteLink);
        const isInternal = isInternalLink({
          internalHostname: data.url.hostname,
          urlHostname: hostname,
          compareSubdomains: true,
        });
        if (!isInternal) {
          continue;
        }
        addInternalLink({ link: `${origin}${pathname}${search}`, data });
      } catch (error) {
        if (log) {
          const errorMessage = getErrorMessage(error);
          logToFile(link, `Error processing link: ${errorMessage}`);
        }
      }
    }
  } catch (error) {
    if (log) {
      const errorMessage = getErrorMessage(error);
      logToFile(link, `Failed to get internal links: ${errorMessage}`);
    }
  }
  return;
}

/**
 * Optionally generates special internal links and adds them as internal links.
 * @param {CollectedData} data - Scraper data.
 */
export function addExtendedSitePaths(data) {
  if (!data.features.extendedSitePaths) return;
  const specialInternalLinks = [
    `${data.url.origin}/wp-login`,
    `${data.url.origin}/wp-admin`,
    `${data.url.origin}/administrator`,
    `${data.url.origin}/user/login`,
    `${data.url.origin}/user`,
    `${data.url.origin}/admin`,
    `${data.url.origin}/config`,
    `${data.url.origin}/typo3/`,
    `${data.url.origin}/admin/login`,
    `${data.url.origin}/login`,
    `${data.url.origin}/log-in`,
    `${data.url.origin}/anmelden`,
    `${data.url.origin}/signin`,
    `${data.url.origin}/sign-in`,
  ];

  for (const link of specialInternalLinks) {
    addInternalLink({ link, data });
  }
}

/**
 * Adds an internal link to the collected data.
 * @param {object} params - Parameters including the link and data.
 * @param {string} params.link - The internal link to add.
 * @param {CollectedData} params.data - The collected data to update.
 */
function addInternalLink({ link, data }) {
  if (data.internalLinks.has(link)) return;
  data.internalLinks.set(link, { visited: false });
}

/**
 * Merges two maps of external links.
 * @param {ExternalLinksMap} map1 - The first external links map.
 * @param {ExternalLinksMap} map2 - The second external links map.
 * @returns {ExternalLinksMap} - The merged external links map.
 */
export function mergeExternalLinksMaps(map1, map2) {
  /** @type { ExternalLinksMap } */
  const mergedMap = new Map(map1);
  for (const [key, cookie2] of map2) {
    const cookie1 = mergedMap.get(key);
    if (cookie1) {
      mergedMap.set(key, mergeExternalLinks(cookie1, cookie2));
    } else {
      mergedMap.set(key, cookie2);
    }
  }

  return mergedMap;
}

/**
 * Merges two sets of external link data.
 * @param {ResponseHeaders} link1 - The first set of link data.
 * @param {ResponseHeaders} link2 - The second set of link data.
 * @returns {ResponseHeaders} - The merged link data.
 */
function mergeExternalLinks(link1, link2) {
  return {
    ...link1,
    firstAddedOnPageNumber: Math.min(
      link1.firstAddedOnPageNumber,
      link2.firstAddedOnPageNumber
    ),
    foundOnUrls: Array.from(
      new Set([...link1.foundOnUrls, ...link2.foundOnUrls])
    ),
  };
}
