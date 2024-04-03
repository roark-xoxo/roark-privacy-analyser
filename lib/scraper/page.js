/**
 * @typedef {import('./types').ScraperOptions} ScraperArgsFeaturesType
 */
import { logToFile } from "../helpers/utils.js";
import { compareDomains, compareSubDomains } from "./urls.js";

/**
 * Determines whether a page was redirected by comparing the domains of the initial link and the final page URL.
 * Uses different comparison strategies based on the 'redirectError' feature flag (either 'domain' or subdomain comparison).
 * Logs the redirection if the 'log' feature is enabled.
 * @function wasPageRedirected
 * @param {object} params - The parameters for the function.
 * @param {string} params.pageUrl - The final URL of the page.
 * @param {string} params.link - The initial link URL.
 * @param {ScraperArgsFeaturesType} params.features - Feature flags for the scraper.
 * @param {string} [params.entryFunctionName] - The name of the entry function, if any.
 * @returns {boolean} - Returns true if the page was redirected, otherwise false.
 * @since 1.0.0
 */
export function wasPageRedirected({
  pageUrl,
  link,
  features,
  entryFunctionName,
}) {
  const { redirectError, log } = features;
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
    if (log && !isSameDomain) {
      logToFile(`page was redirected: ${link} to ${pageUrl}`);
    }
  } catch (error) {
    if (log) {
      logToFile(
        "wasPageRedirected error",
        pageUrl,
        "to",
        link,
        "via fn",
        entryFunctionName ?? "",
        error
      );
    }
    isSameDomain = false;
  }
  return !isSameDomain;
}
