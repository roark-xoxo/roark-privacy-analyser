import type {
  Browser as PuppeteerBrowser,
  Page as PagePuppeteer,
} from "puppeteer";
import type {
  Browser as PlaywrightBrowser,
  Page as PagePlaywright,
} from "playwright";

export type Cookie = {
  name: string;
  value: string;
  domain: string;
  path: string;
  expires: number;
  httpOnly: boolean;
  secure: boolean;
  session: boolean;
  validForMinutes: number | null;
  firstAddedOnPageNumber: number;
  foundOnUrls: string[];
};

export type CookiesArray = Cookie[];
export type CookiesMap = Map<string, Cookie>;

export type Exact<T, Shape> = T & {
  [K in Exclude<keyof T, keyof Shape>]: never;
};

export interface ScrapeResults {
  success: boolean;
  status: number;
  url: {
    href: string;
    origin: string;
    hostname: string;
    baseUrl: string;
  };
  emailAddresses: string[];
  internalUrls: string[];
  externalUrls: ResponseHeaders[];
  externalScripts: ScriptsRecordFields[] | [];
  cookies: CookiesArray;
  pagesVisited: number;
  privacyPage: string[];
  internalTechStack: string[];
  externalTechStack: string[];
  pageTitle: string;
  pageDescription: string;
  baseUrl: string | null;
  scrapeTime: number;
  message: string;
  redirectUrl: string | null;
  records: {
    urls: string[] | [] | null;
    cookies: string[] | [] | null;
  };
}

export interface ErrorMessage {
  status: "error";
  message: string;
}

export type ScraperReturnObject = {
  results: ScrapeResults;
  collectedData: CollectedData;
};

export type CollectedData = {
  browser: BrowserType;
  internalLinks: InternalLinksMap;
  externalLinks: ExternalLinksMap;
  scripts: ScriptsMap;
  techStack: TechStackData;
  cookies: CookiesMap;
  emailAddresses: EmailAddresses;
  pagesVisited: number;
  pageTitle: string;
  pageDescription: string;
  redirectUrl: string | null;
  usesCloudflareTurnstyle?: boolean;
  url: {
    href: string;
    origin: string;
    hostname: string;
    baseUrl: string;
  };
  options: ScraperOptions;
  browsers: {
    puppeteer: {
      browser: PuppeteerBrowser | null;
      page: PagePuppeteer | null;
    };
    playwright: {
      browser: PlaywrightBrowser | null;
      page: PagePlaywright | null;
    };
  };
};

export type TechStackData = {
  internal: TechStack;
  external: TechStack;
};

export type BrowserType = "firefox" | "chromium" | "webkit";

export type InternalLinksMap = Map<string, InternalLinksStatus>;

export type InternalLinksStatus = {
  visited: boolean;
  status?: number;
};

export type TechStack = Set<string>;
export type EmailAddresses = Set<string>;

export type ScriptsMap = Map<string, ScriptsType>;
type ScriptsType = {
  url: string;
  scriptname: string;
  hostname: string;
  pathname: string;
  server: string;
  isExternal: boolean;
};

export type ScraperArgs = {
  url: string;
  options: ScraperOptions;
};

export type ScraperOptions = {
  engine: ScrapeEngine;
  pageLimit: number;
  headless: boolean;
  browser: BrowserType;
  waitUntil: WaitUntilOptions;
  scroll: boolean;
  delay: number;
  log: boolean;
  redirectError: RedirectErrorOptions;
  clickElement: string | null;
  sitemapUrl: string | null;
  sitemapSearch: boolean;
  extendedSitePaths: boolean;
  privacyPage: boolean;
  emails: boolean;
};

export type ScrapeEngine = "puppeteer" | "playwright" | "both";

export type WaitUntilOptions =
  | WaitUntilOptionsPlaywright
  | WaitUntilOptionsPuppeteer;

export type WaitUntilOptionsPuppeteer =
  | "domcontentloaded"
  | "load"
  | "networkidle0"
  | "networkidle2";

export type WaitUntilOptionsPlaywright =
  | "domcontentloaded"
  | "load"
  | "networkidle";

export type RedirectErrorOptions = "domain" | "subdomain" | null;

export interface ErrorResponse {
  success?: boolean;
  status?: number;
  message?: string | null;
  error: unknown;
}

export type ErrorType = Error | string | undefined;

export interface SuccessResponse {
  success?: boolean;
  status?: number;
  message?: string | null;
  data?: unknown;
}

export type RequestOrResponseHeaders = Record<string, string>;

export type ResultProps = {
  resultsPuppeteer: ScraperReturnObject;
  resultsPlaywright: ScraperReturnObject;
};

export type ExternalLinksMap = Map<string, ResponseHeaders>;

export interface ResponseHeaders {
  hostname?: string;
  server?: string;
  setCookie?: string;
  setCookieAlt?: string;
  poweredBy?: string;
  via?: string;
  akamaiCacheStatus?: string;
  xCache?: string;
  xCacheAlt?: string;
  xAmzCfPop?: string;
  xAmzRid?: string;
  firstAddedOnPageNumber: number;
  foundOnUrls: string[];
}

export type ScriptsRecordFields = {
  url: string | null;
  scriptname: string | null;
  hostname: string[];
  pathname: string | null;
  server?: string[];
};
