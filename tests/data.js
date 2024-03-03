import { getEmailAddressesFromHTML } from "../lib/scraper/email.js";

function tests() {
  testGetEmailAddressesFromHTML();
}

function testGetEmailAddressesFromHTML() {
  const string = "mailto:roark@roark.at über@uber.com hi@---@hi mailto:über@über.de ä@b.com marcello.curto.mail@mail.com mail@google.google.com mail@longtld.website img-2x@me.jpg";
  const addresses = getEmailAddressesFromHTML(string);
  console.log(addresses);
}

function testEmailFilter() {}

tests();
