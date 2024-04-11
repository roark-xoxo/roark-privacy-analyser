import { describe, it, expect } from "vitest";
import { compareDomains, compareSubDomains } from "../../lib/urls.js";

describe("compareDomains", () => {
  it("should return true for identical domains", () => {
    expect(compareDomains("example.com", "example.com")).toBe(true);
  });

  it("should return true for identical domains including subdomain", () => {
    expect(compareDomains("subdomain.example.com", "example.com")).toBe(true);
  });

  it("should return false for different domains", () => {
    expect(compareDomains("example.com", "test.com")).toBe(false);
  });

  it("should return false for different TLDs", () => {
    expect(compareDomains("example.com", "example.net")).toBe(false);
  });

  it("should ignore www subdomain", () => {
    expect(compareDomains("www.example.com", "example.com")).toBe(true);
    expect(compareDomains("www.example.com", "www.example.com")).toBe(true);
  });
});

describe("compareSubDomains", () => {
  it("should return true for identical subdomains", () => {
    expect(compareSubDomains("sub.example.com", "sub.example.com")).toBe(true);
  });

  it("should return false for different subdomains", () => {
    expect(compareSubDomains("sub.example.com", "test.example.com")).toBe(
      false
    );
  });

  it("should ignore www subdomain", () => {
    expect(compareSubDomains("www.sub.example.com", "sub.example.com")).toBe(
      true
    );
    expect(compareSubDomains("sub.example.com", "www.sub.example.com")).toBe(
      true
    );
  });

  it("should return true for multiple subdomain levels", () => {
    expect(compareSubDomains("a.b.example.com", "a.b.example.com")).toBe(true);
  });

  it("should return false for different levels of subdomains", () => {
    expect(compareSubDomains("a.b.example.com", "b.example.com")).toBe(false);
  });
});
