/**
 * @typedef {import('./types').ScraperOptions} ScraperOptions
 */
import { getErrorMessage, logging } from "./utils.js";
import { compareDomains, compareSubDomains } from "./urls.js";

/**
 * Determines whether a page was redirected by comparing the domains of the initial link and the final page URL.
 * Uses different comparison strategies based on the 'redirectError' feature flag (either 'domain' or subdomain comparison).
 * Logs the redirection if the 'log' feature is enabled.
 * @function wasPageRedirected
 * @param {object} params - The parameters for the function.
 * @param {string} params.pageUrl - The final URL of the page.
 * @param {string} params.link - The initial link URL.
 * @param {ScraperOptions} params.options - Feature flags for the scraper.
 * @returns {boolean} - Returns true if the page was redirected, otherwise false.
 * @since 0.1.0
 */
export function wasPageRedirected({ pageUrl, link, options }) {
  const { redirectError } = options;
  if (!redirectError) return false;

  let isSameDomain = true;
  try {
    const initialBaseDomain = new URL(link).hostname;
    const finalBaseDomain = new URL(pageUrl).hostname;

    if (redirectError === "domain") {
      isSameDomain = compareDomains(initialBaseDomain, finalBaseDomain);
    } else {
      isSameDomain = compareSubDomains(initialBaseDomain, finalBaseDomain);
    }
    if (!isSameDomain) {
      logging(`page was redirected: ${link} to ${pageUrl}`);
    }
  } catch (error) {
    logging(
      `wasPageRedirected error ${pageUrl} to ${link} - error: ${getErrorMessage(
        error
      )}`
    );
    isSameDomain = false;
  }
  return !isSameDomain;
}
