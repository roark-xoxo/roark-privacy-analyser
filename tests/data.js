import { getEmailAddressesFromHTML } from "../lib/scraper/email.js";

/**
 * Extracts email addresses from HTML content, including addresses with international characters.
 * @returns {string[]} - An array of email addresses.
 * @since 1.0.0
 */
function tests() {
  testGetEmailAddressesFromHTML();
}

/**
 * Extracts email addresses from HTML content, including addresses with international characters.
 * @param {string} html - The HTML content to extract email addresses from.
 * @returns {string[]} - An array of email addresses.
 * @since 1.0.0
 */
function testGetEmailAddressesFromHTML() {
  const string = "mailto:roark@roark.at über@uber.com hi@---@hi mailto:über@über.de ä@b.com marcello.curto.mail@mail.com mail@google.google.com mail@longtld.website img-2x@me.jpg";
  const addresses = getEmailAddressesFromHTML(string);
  console.log(addresses);
}

/**
 * Extracts email addresses from HTML content, including addresses with international characters.
 * @param {string} html - The HTML content to extract email addresses from.
 * @returns {string[]} - An array of email addresses.
 * @since 1.0.0
 */
function testEmailFilter() {}

tests();
