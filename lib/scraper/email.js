import { getInvalidExtensions } from "../helpers/validation.js";
import { z } from "zod";

/**
 * @typedef {import('playwright').Page} Page
 * @typedef {import('puppeteer').Page} PuppeteerPage
 * @typedef {import('./types').CollectedData} CollectedData
 */

/**
 * Retrieves email addresses from a Playwright page.
 * @param {object} params - The parameters for the function.
 * @param {Page} params.page - The Playwright page object.
 * @param {CollectedData} params.data - The collected data object.
 * @returns {Promise<void>}
 * @since 1.0.0
 */
export async function getEmailAddresses({ page, data }) {
  const html = await page.content();
  const addresses = getEmailAddressesFromHTML(html);
  return await addEmailAddresses({ data, addresses });
}

/**
 * Retrieves email addresses from a Puppeteer page.
 * @param {object} params - The parameters for the function.
 * @param {PuppeteerPage} params.page - The Puppeteer page object.
 * @param {CollectedData} params.data - The collected data object.
 * @returns {Promise<void>}
 * @since 1.0.0
 */
export async function getEmailAddressesPuppeteer({ page, data }) {
  const html = await page.content();
  const addresses = getEmailAddressesFromHTML(html);
  return await addEmailAddresses({ data, addresses });
}

/**
 * Extracts email addresses from HTML content.
 * @param {string} html - The HTML content to extract email addresses from.
 * @returns {string[]} - An array of email addresses.
 */
function getEmailAddressesFromHTML(html) {
  const addresses = html.match(
    /(?:mailto:)?([\w-.]+)@((?:[\w]+\.)+)([a-zA-Z]{2,10})/g
  );

  if (!addresses || !Array.isArray(addresses)) return [];
  return addresses;
}

/**
 * Filters out email addresses based on certain criteria.
 * @param {string} value - The email address to be filtered.
 * @returns {boolean} - Returns true if the email address passes the filter.
 */
function filterEmailAddress(value) {
  if (getInvalidExtensions().some((ext) => value.toLowerCase().includes(ext))) {
    return false;
  }
  return true;
}

/**
 * Adds valid email addresses to the collected data.
 * @param {object} params - The parameters for the function.
 * @param {(string[] | RegExpMatchArray)} params.addresses - The list of email addresses.
 * @param {CollectedData} params.data - The collected data object.
 * @returns {Promise<void>}
 */
async function addEmailAddresses({ addresses, data }) {
  const emailSchema = z
    .string()
    .min(3)
    .trim()
    .email()
    .refine((value) => filterEmailAddress(value));

  for (const address of addresses) {
    if (!address) continue;
    try {
      const email = address.replace("mailto:", "");
      await emailSchema.parseAsync(email);
      data.emailAddresses.add(email);
    } catch (_error) {
      continue;
    }
  }
  return;
}
