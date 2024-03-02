/**
 * @typedef {import('../airtable/types.d.ts').UrlsRecordFields} UrlsRecordFields
 * @typedef {import('./types.d.ts').BoxesContent} BoxesContent
 * @typedef {import('./types.d.ts').Cookie} Cookie
 * @typedef {import('./types.d.ts').CookiesArray} CookiesArray
 * @typedef {import('./types.d.ts').ScrapeResults} ScrapeResults
 * @typedef {import('./types.d.ts').WebsiteData} WebsiteData
 */

/**
 * Extracts website data from scraping results.
 * @function getWebsiteData
 * @param {ScrapeResults} results - The scraping results.
 * @returns {WebsiteData} The structured website data.
 * @since 1.0.0
 */
export function getWebsiteData(results) {
  return {
    cookies: getCookieContent(results.cookies),
    urls: getUrlsContent(results.externalUrls),
    pagesVisited: results.pagesVisited,
  };
}

/**
 * Formats cookie data into a content box structure.
 * @function getCookieContent
 * @param {CookiesArray} cookies - Array of cookies.
 * @returns {BoxesContent} Formatted cookie content.
 * @since 1.0.0
 */
export function getCookieContent(cookies) {
  if (!cookies) return [];
  const list = [];

  for (const cookie of cookies) {
    if (!cookie) continue;
    list.push({
      title: cookie.name,
      items: [
        { label: "Domain", value: cookie.domain },
        { label: "Gültig für", value: getExpirationDate(cookie) },
      ],
    });
  }

  return list;
}

/**
 * Calculates the expiration date of a cookie.
 * @function getExpirationDate
 * @param {Cookie} cookie - The cookie object.
 * @returns {string|null} The expiration date as a string or null.
 * @since 1.0.0
 */
export function getExpirationDate(cookie) {
  if (cookie.session === true) return "Session";
  if (
    cookie.validForMinutes === null ||
    typeof cookie.validForMinutes === "undefined"
  ) {
    return null;
  }

  const days = Math.floor(cookie.validForMinutes / (24 * 60));
  if (days === 1) return "1 Tag";
  if (days > 1) return `${days} Tage`;

  if (cookie.validForMinutes === 1) return "1 Minute";
  if (cookie.validForMinutes > 1) return `${cookie.validForMinutes} Minuten`;
  return "0 Minuten";
}

/**
 * Formats URL data into a content box structure.
 * @function getUrlsContent
 * @param {UrlsRecordFields[]} urls - Array of URL records.
 * @returns {BoxesContent} Formatted URL content.
 * @since 1.0.0
 */
export function getUrlsContent(urls) {
  if (!urls) return [];
  const list = [];

  for (const url of urls) {
    if (!url) continue;
    const title = url.Name ?? null;
    if (!title) continue;
    const items = [];
    if (url.server) items.push({ label: "Server", value: url.server });
    list.push({ title, items });
  }

  return list;
}

/**
 * Retrieves the server information from a URL record.
 * @function getUrlServer
 * @param {UrlsRecordFields} url - The URL record.
 * @returns {string|null} The server information or null.
 * @since 1.0.0
 */
export function getUrlServer(url) {
  if (!url) return null;
  if (url.server) return url.server;
  if (url.poweredBy) return url.poweredBy;
  if (url.via) return url.via;
  if (url.akamaiCacheStatus) return "Akamai";
  if (url.xCache || url.xCacheAlt || url.xAmzCfPop || url.xAmzRid) {
    return "Amazon Web Services";
  }
  return null;
}
