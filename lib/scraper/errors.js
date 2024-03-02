/**
 * @typedef {import('../helpers/validation.js')} ValidationHelpers
 * @typedef {unknown} ErrorType
 * @since 1.0.0
 */

import { getErrorMessage } from "../helpers/validation.js";

/**
 * Determines the correct HTTP protocol for a given URL.
 * If the URL is already using HTTPS, it converts to non-SSL (HTTP).
 * If the URL is using HTTP, it converts to SSL (HTTPS).
 * If the URL does not contain either protocol, it returns the original URL.
 * @param {string} url - The URL to evaluate.
 * @returns {string} - The URL with the correct protocol.
 * @since 1.0.0
 */
export function getCorrectHttpProtocol(url) {
  if (url.includes("https://")) return getNonSSLUrl(url);
  if (url.includes("http://")) return getSSLUrl(url);
  return url;
}

/**
 * Converts an HTTP URL to HTTPS.
 * @param {string} url - The HTTP URL to convert.
 * @returns {string} - The converted HTTPS URL.
 * @since 1.0.0
 */
function getSSLUrl(url) {
  return url.replace("http://", "https://");
}

/**
 * Converts an HTTPS URL to HTTP.
 * @param {string} url - The HTTPS URL to convert.
 * @returns {string} - The converted HTTP URL.
 * @since 1.0.0
 */
function getNonSSLUrl(url) {
  return url.replace("https://", "http://");
}

/**
 * Determines if an error is related to HTTPS issues.
 * @param {ErrorType} error - The error to evaluate.
 * @returns {boolean} - True if the error is an HTTPS error, false otherwise.
 * @since 1.0.0
 */
export function isHttpsError(error) {
  const message = getErrorMessage(error);
  return (
    message.includes("ERR_SSL") ||
    message.includes("ERR_CERT") ||
    message.includes("ERR_CONNECTION_REFUSED") ||
    message.includes("ERR_CONNECTION_CLOSED") ||
    message.includes("ERR_CONNECTION_RESET")
  );
}

/**
 * Determines if an error is related to Cloudflare's Turnstile mechanism.
 * @param {ErrorType} error - The error to evaluate.
 * @returns {boolean} - True if the error is a Turnstile error, false otherwise.
 * @since 1.0.0
 */
export function isTurnstyleError(error) {
  const message = getErrorMessage(error);
  return message.includes("ERROR: uses cloudflare turnstyle");
}

/**
 * Determines if an error is related to domain issues.
 * @param {ErrorType} error - The error to evaluate.
 * @returns {boolean} - True if the error is a domain-related error, false otherwise.
 * @since 1.0.0
 */
export function isDomainError(error) {
  const message = getErrorMessage(error);
  return (
    message.includes("ERR_ABORTED") ||
    message.includes("ERR_NAME_NOT_RESOLVED") ||
    message.includes("ERR_ADDRESS_UNREACHABLE")
  );
}

/**
 * Determines if an error is due to page redirection issues.
 * @param {ErrorType} error - The error to evaluate.
 * @returns {boolean} - True if the error is a redirect error, false otherwise.
 * @since 1.0.0
 */
export function isPageRedirectError(error) {
  const message = getErrorMessage(error);
  return message.includes("RedirectError");
}

/**
 * Determines if an error is related to a timeout issue.
 * @param {ErrorType} error - The error to evaluate.
 * @returns {boolean} - True if the error is a timeout error, false otherwise.
 * @since 1.0.0
 */
export function isTimeoutErrror(error) {
  const message = getErrorMessage(error);
  return (
    message.includes("Navigation timeout of") ||
    message === "TimeoutError on first page"
  );
}

/**
 * Determines if a timeout error occurred on the first page.
 * @param {object} params - The parameters.
 * @param {ErrorType} params.error - The error to evaluate.
 * @param {number} params.pagesVisited - The number of pages visited.
 * @returns {boolean} - True if the timeout error occurred on the first page, false otherwise.
 * @since 1.0.0
 */
export function isTimeoutErrorOnFirstPage({ error, pagesVisited }) {
  if (pagesVisited > 0) return false;
  return isTimeoutErrror(error);
}
