import type {
  Browser as PuppeteerBrowser,
  Page as PagePuppeteer,
} from "puppeteer";
import type {
  Browser as PlaywrightBrowser,
  Page as PagePlaywright,
} from "playwright";
import type {
  CookieRecordFields,
  MultipleRecordLinks,
  SingleLineText,
  UrlsRecordFields,
  WebsiteRecordFields,
} from "../airtable/types.d.ts";

export interface Cookie {
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
}

export type CookiesArray = Cookie[];
export type CookiesMap = Map<string, Cookie>;

export type Exact<T, Shape> = T & {
  [K in Exclude<keyof T, keyof Shape>]: never;
};

export type WebsiteRecordsRequestBody = {
  typecast: boolean;
  fields: WebsiteRecordFields;
};

export type ScriptsAirtableRecords = ScriptsAirtableRecord[];

type ScriptsAirtableRecord = {
  fields: ScriptsRecordFields;
};

export type ScriptsRecord = {
  id: string;
  createdTime: string;
  fields: ScriptsRecordFields;
};

export type ScriptsRecordFields = {
  url: SingleLineText;
  scriptname: SingleLineText;
  hostname: MultipleRecordLinks;
  pathname: SingleLineText;
  server?: MultipleRecordLinks;
};

export interface AirtableAutomationRequestBody {
  url?: string;
  pageLimit?: string;
  tableId?: string;
  baseId?: string;
  atId?: string;
  fieldId?: string;
  options?: GenerateTextOptions;
  clickElement?: string;
  sitemapsUrl?: string;
  sitemapSearch?: boolean;
  delay?: number;
}

export interface ScrapeResults {
  success: ResponseSuccess;
  status: ResponseStatus;
  emailAddresses: string[];
  internalUrls: string[];
  externalUrls: UrlsRecordFields[];
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

export type UrlsArray = [string, ResponseHeaders][] | [];

export interface ResponseHeaders {
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

export interface ErrorMessage {
  status: "error";
  message: string;
}

export type GenerateTextOptions = {
  baseQuestion: string;
  objectName: string;
  answerSpecifier: string;
  instruction: string;
};

export type TextAnswerRespone = {
  status: "success";
  message: string;
};

export type ScraperReturnObject = {
  results: ScrapeResults;
  collectedData: CollectedData;
  websiteData: WebsiteData;
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
  features: ScraperArgsFeaturesType | null;
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

export type ExternalLinksMap = Map<string, ResponseHeaders>;
export type TechStack = Set<string>;
export type EmailAddresses = Set<string>;

export type ScriptsMap = Map<string, ScriptsType>;
type ScriptsType = {
  url: SingleLineText;
  scriptname: string;
  hostname: string;
  pathname: string;
  server: string;
  isExternal: boolean;
};

export type ScraperArgsBody = {
  scraper: ScraperArgsType;
  airtable?: AirtableUpdateScraperArgs;
};

export type ScraperArgsType = {
  url: string;
  features: ScraperArgsFeaturesType;
  airtable?: AirtableUpdateScraperArgs;
};

export type AirtableUpdateScraperArgs = {
  tableId: string;
  baseId: string;
  atId: string;
};

export type ScraperArgsFeaturesType = {
  pageLimit: number | null;
  log: boolean | null;
  waitUntil: WaitUntilOptions;
  engine: ScrapeEngine;
  privacyPage?: boolean | null;
  emails?: boolean | null;
  clickElement?: string | null;
  sitemapUrl?: string | null;
  sitemapSearch?: boolean | null;
  delay?: number | null;
  browser?: BrowserType;
  browserMode?: BrowserModes;
  scroll?: boolean;
  redirectError?: RedirectErrorOptions;
  extendedSitePaths?: boolean;
  queuePriority?: number;
};

export type ScrapeEngineOptions = "puppeteer" | "playwright";
export type ScrapeEngine =
  | "puppeteer"
  | "playwright"
  | "both"
  | ScrapeEngineOptions[];

export type BrowserModes = "headless" | "headful";

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

export type ExternalUrlsAirtableRecords = ExternalUrlsAirtableRecord[] | null;

type ExternalUrlsAirtableRecord = {
  fields: UrlsRecordFields;
};

export type UrlsRecord = {
  id: string;
  createdTime: string;
  fields: UrlsRecordFields;
};

export type CookieAirtableRecords = CookieAirtableRecord[];

type CookieAirtableRecord = {
  fields: CookieRecordFields;
};

export type CookieRecord = {
  id: string;
  createdTime: string;
  fields: CookieRecordFields;
};

export interface WebsiteData {
  cookies: BoxesContent;
  urls: BoxesContent;
  pagesVisited: number;
}

type ResponseSuccess = boolean;
type ResponseStatus = number;
export type ResponseMessage = string | null;

export type BoxesContent = BoxContent[];

export type BoxContent = {
  title: string;
  items?: BoxContentItems;
};

export type BoxContentItems = BoxContentItem[];

export type BoxContentItem = {
  label: string;
  value: string | null;
};

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

export interface SuccessResponseWebsiteData
  extends Omit<SuccessResponse, "data"> {
  data?: WebsiteData | null;
}

export type RequestOrResponseHeaders = Record<string, string>;

export type ResultProps = {
  resultsPuppeteer: ScraperReturnObject;
  resultsPlaywright: ScraperReturnObject;
};
