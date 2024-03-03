import { getInvalidExtensions } from "../helpers/validation.js";

/**
 * @typedef {import('./types').CollectedData} CollectedData
 */

/**
 * Retrieves email addresses from a string.
 * @param {object} params - The parameters for the function.
 * @param {string} params.html - The html string.
 * @param {CollectedData} params.data - The collected data object.
 * @returns {import("./types.js").EmailAddresses[]} - An array of filtered email addresses.
 * @since 1.0.0
 */
export function getEmailAddresses({ html, data }) {
  const addresses = getEmailAddressesFromHTML(html);
  return addresses.map((address) => data.emailAddresses.add(address));
}

/**
 * Extracts email addresses from HTML content, including addresses with international characters.
 * @param {string} html - The HTML content to extract email addresses from.
 * @returns {string[]} - An array of email addresses.
 */
export function getEmailAddressesFromHTML(html) {
  const emailRegex =
    /(?:mailto:)?([a-zA-Z0-9.!#$%&'*+/=?^_`{|}~\u00C0-\u00FF-]+)@((?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,10})/g;
  const matches = html.match(emailRegex);
  if (!matches) return [];
  return matches
    .map((match) => match.replace("mailto:", "").trim())
    .filter((value) => {
      if (
        getInvalidExtensions().some((ext) => value.toLowerCase().includes(ext))
      ) {
        return false;
      } else {
        return true;
      }
    });
}
