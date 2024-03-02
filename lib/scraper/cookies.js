/**
 * @typedef {import('./types').CollectedData} CollectedData
 * @typedef {import('./types').Cookie} Cookie
 * @typedef {import('./types').CookiesMap} CookiesMap
 * @typedef {import('playwright').Page} PlaywrightPage
 * @typedef {import('puppeteer').Page} PuppeteerPage
 * @typedef {import('playwright').Cookie} PlaywrightCookie
 * @typedef {import('puppeteer').Protocol.Network.Cookie} PuppeteerCookie
 */

import { logToFile } from "../helpers/utils.js";

/**
 * Retrieves cookies using Playwright and updates the collected data map.
 * @async
 * @function getCookiesPlaywright
 * @param {object} args - The Playwright page instance.
 * @param {PlaywrightPage} args.page - The Playwright page instance.
 * @param {CollectedData} args.data - Collected data object to update with cookies.
 * @returns {Promise<void>}
 * @since 1.0.0
 */
export async function getCookiesPlaywright({ page, data }) {
  try {
    const cookies = await page.context().cookies();
    const existingCookies = data.cookies;
    const pageUrl = new URL(page.url());
    const url = pageUrl.origin + pageUrl.pathname;

    for (const cookie of cookies) {
      const name = getCookieName(cookie.name);
      if (existingCookies.has(name)) {
        const existingCookie = existingCookies.get(name);
        if (!existingCookie) continue;
        const urlSet = new Set(existingCookie.foundOnUrls);
        urlSet.add(url);
        existingCookie.foundOnUrls = [...urlSet];
      } else {
        data.cookies.set(name, {
          name: name,
          value: cookie.value,
          domain: getCookieDomain(cookie.domain),
          path: cookie.path,
          expires: cookie.expires,
          httpOnly: cookie.httpOnly,
          secure: cookie.secure,
          session: cookie.expires === -1 || !cookie.expires,
          validForMinutes: getCookieValidFor(cookie),
          firstAddedOnPageNumber: data.pagesVisited + 1,
          foundOnUrls: [url],
        });
      }
    }
    await page.context().clearCookies();
  } catch (error) {
    logToFile("fn_getCookiesPuppeteer", error);
  }
  return;
}

/**
 * Retrieves cookies using Puppeteer and updates the collected data map.
 * @async
 * @function getCookiesPuppeteer
 * @param {object} args - The Puppeteer page instance.
 * @param {PuppeteerPage} args.page - The Puppeteer page instance.
 * @param {CollectedData} args.data - Collected data object to update with cookies.
 * @returns {Promise<void>}
 * @since 1.0.0
 */
export async function getCookiesPuppeteer({ page, data }) {
  try {
    const client = await page.target().createCDPSession();
    const cookies = (await client.send("Network.getAllCookies")).cookies;
    const existingCookies = data.cookies;
    const pageUrl = new URL(page.url());
    const url = pageUrl.origin + pageUrl.pathname;

    for (const cookie of cookies) {
      const name = getCookieName(cookie.name);
      if (existingCookies.has(name)) {
        const existingCookie = existingCookies.get(name);
        if (!existingCookie) continue;
        const urlSet = new Set(existingCookie.foundOnUrls);
        urlSet.add(url);
        existingCookie.foundOnUrls = [...urlSet];
      } else {
        data.cookies.set(name, {
          name: name,
          value: cookie.value,
          domain: getCookieDomain(cookie.domain),
          path: cookie.path,
          expires: cookie.expires,
          httpOnly: cookie.httpOnly,
          secure: cookie.secure,
          session: cookie.session ?? false,
          validForMinutes: getCookieValidFor(cookie),
          firstAddedOnPageNumber: data.pagesVisited + 1,
          foundOnUrls: [url],
        });
      }
    }
    await client.send("Network.clearBrowserCookies");
  } catch (error) {
    logToFile("fn_getCookiesPuppeteer", error);
  }
  return;
}

/**
 * Calculates the validity duration of a cookie in minutes.
 * @function getCookieValidFor
 * @param {PlaywrightCookie|PuppeteerCookie} cookie - The cookie object.
 * @returns {number|null} The validity duration in minutes, or null.
 * @since 1.0.0
 */
function getCookieValidFor(cookie) {
  let expireTime = cookie.expires
    ? (cookie.expires - new Date().getTime() / 1000) / 60
    : null;

  if (expireTime) {
    expireTime = Math.round(expireTime);
  }

  return expireTime;
}

/**
 * Merges two maps of cookies into one.
 * @function mergeCookieMaps
 * @param {CookiesMap} map1 - The first cookie map.
 * @param {CookiesMap} map2 - The second cookie map.
 * @returns {CookiesMap} The merged cookies map.
 * @since 1.0.0
 */
export function mergeCookieMaps(map1, map2) {
  /** @type {CookiesMap} */
  const mergedMap = new Map(map1);
  for (const [key, cookie2] of map2) {
    const cookie1 = mergedMap.get(key);
    if (cookie1) {
      mergedMap.set(key, mergeCookies(cookie1, cookie2));
    } else {
      mergedMap.set(key, cookie2);
    }
  }

  return mergedMap;
}

/**
 * Merges two cookie objects into one.
 * @function mergeCookies
 * @param {Cookie} cookie1 - The first cookie object.
 * @param {Cookie} cookie2 - The second cookie object.
 * @returns {Cookie} The merged cookie object.
 * @since 1.0.0
 */
function mergeCookies(cookie1, cookie2) {
  return {
    name: cookie1.name,
    value: cookie1.value,
    domain: cookie1.domain,
    path: cookie1.path,
    expires: Math.max(cookie1.expires ?? 0, cookie2.expires ?? 0),
    httpOnly: cookie1.httpOnly,
    secure: cookie1.secure,
    session: cookie1.session,
    validForMinutes: Math.max(
      cookie1.validForMinutes ?? 0,
      cookie2.validForMinutes ?? 0
    ),
    firstAddedOnPageNumber: Math.min(
      cookie1.firstAddedOnPageNumber,
      cookie2.firstAddedOnPageNumber
    ),
    foundOnUrls: Array.from(
      new Set([...cookie1.foundOnUrls, ...cookie2.foundOnUrls])
    ),
  };
}

/**
 * Normalizes cookie names to a standard format.
 * @function getCookieName
 * @param {string} name - The original cookie name.
 * @returns {string} The normalized cookie name.
 * @since 1.0.0
 */
function getCookieName(name) {
  if (name.startsWith("_gat_gtag_UA_")) return "_gat_gtag_UA_XXXXXXX_X";
  if (name.startsWith("_gat_UA-")) return "_gat_UA-XXXXXXXX-X";
  if (name.startsWith("_ga_")) return "_ga_XXXXXXXXXX";
  if (name.startsWith("_gat_")) return "_gat_XXXXXXXX";
  if (name.startsWith("_pk_cvar.")) return "_pk_cvar.XX.XXXX";
  if (name.startsWith("_pk_id.")) return "_pk_id.X.XXXX";
  if (name.startsWith("_pk_ref.")) return "_pk_ref.X.XXXX";
  if (name.startsWith("_pk_ses.")) return "_pk_ses.X.XXXX";
  if (name.startsWith("_pk_testcookie.")) return "_pk_testcookie.X.XXXX";
  if (name.startsWith("_sp_id.")) return "_sp_id.XXXX";
  if (name.startsWith("_sp_ses.")) return "_sp_ses.XXXX";
  if (name.startsWith("gaDomain-")) return "gaDomain-XXXXXX";
  if (name.startsWith("incap_ses_")) return "incap_ses_XXX_XXXXXX";
  if (name.startsWith("visid_incap_")) return "visid_incap_XXXXXX";
  if (name.startsWith("_hjIncludedInSessionSample_"))
    return "_hjIncludedInSessionSample_xxxxxx";
  if (name.startsWith("_hjSession_")) return "_hjSession_xxxxx";
  if (name.startsWith("_hjSessionUser_")) return "_hjSessionUser_xxxxxxx";
  if (name.startsWith("Queue-it-")) return "Queue-it-xxx-xxx-xxx-xxx-xxx";
  return name;
}

/**
 * Normalizes cookie domains by removing leading dots.
 * @function getCookieDomain
 * @param {string} domain - The original cookie domain.
 * @returns {string} The normalized cookie domain.
 * @since 1.0.0
 */
function getCookieDomain(domain) {
  if (domain.startsWith(".")) return domain.substring(1);
  return domain;
}
