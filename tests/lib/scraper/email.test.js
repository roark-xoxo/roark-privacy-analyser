import { expect, test } from "vitest";
import { getEmailAddressesFromHTML } from "../../../lib/scraper/email.js";

test("Filters emails from HTML string", () => {
  const string =
    "mailto:roark@roark.at über@uber.com hi@---@hi mailto:über@über.de ä@b.com marcello.curto.mail@mail.com mail@google.google.com mail@longtld.website img-2x@me.jpg";
  const addresses = getEmailAddressesFromHTML(string);
  expect(addresses).toEqual([
    "roark@roark.at",
    "über@uber.com",
    "ä@b.com",
    "marcello.curto.mail@mail.com",
    "mail@google.google.com",
    "mail@longtld.website",
  ]);
});
