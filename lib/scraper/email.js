import { getInvalidExtensions } from "../helpers/validation.js";

/**
 * Retrieves email addresses from a string and adds it to the emailAdrresses Set.
 * @param {object} params - The parameters for the function.
 * @param {string} params.html - The html string.
 * @param {import('./types').CollectedData} params.data - The collected data object.
 * @returns {void}
 * @since 1.0.0
 */
export function addEmailAddresses({ html, data }) {
  const addresses = getEmailAddressesFromHTML(html);
  addresses.map((address) => data.emailAddresses.add(address));
  return;
}

/**
 * Retrieves email addresses from a string.
 * @param {string} html - The HTML content to extract email addresses from.
 * @returns {string[]} - An array of email addresses.
 * @since 1.0.0
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
