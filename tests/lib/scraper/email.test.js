import { expect, test } from "vitest";
import { getEmailAddressesFromHTML } from "../../../lib/email.js";

test("Filters emails from HTML string", () => {
  const string =
    "mailto:roark@roark.at über@uuber.com hi@---@hi mailto:über@über.de ä@b.com marcello.curto.mail@mail.com mail@goo.goo.com mail@longtld.website img-2x@me.jpg";
  const addresses = getEmailAddressesFromHTML(string);
  expect(addresses).toEqual([
    "roark@roark.at",
    "über@uuber.com",
    "ä@b.com",
    "marcello.curto.mail@mail.com",
    "mail@goo.goo.com",
    "mail@longtld.website",
  ]);
});
