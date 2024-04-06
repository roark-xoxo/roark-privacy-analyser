import type {
  Browser as PuppeteerBrowser,
  Page as PagePuppeteer,
} from "puppeteer";
import type {
  Browser as PlaywrightBrowser,
  Page as PagePlaywright,
} from "playwright";

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

export type ExternalLinksMap = Map<string, ResponseHeaders>;
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

export interface Attachment {
  id: string;
  url: string;
  filename: string;
  size: number;
  type: string;
  thumbnails?: {
    small: Thumbnail;
    large: Thumbnail;
    full: Thumbnail;
  };
}

export interface Thumbnail {
  url: string;
  width: number;
  height: number;
}

export type UpserptRecords = {
  records: {
    id: string;
    createdTime: string;
    fields: unknown;
  }[];
  updatedRecords: string[];
  createdRecords: string[];
};

export interface UpdateRecordsBody<FieldsType> {
  typecast: boolean;
  records: UpdateRecords<FieldsType>;
}
export interface UpdateRecordsBodyUpsert<FieldsType>
  extends UpdateRecordsBody<FieldsType> {
  performUpsert: { fieldsToMergeOn: FieldsToMergeOn };
}

export type BaseId = string;
export type TableId = string;

export type FieldsToMergeOn = string[];

export type ApiRequest = {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  url: string;
  body?: RequestBody;
};

export interface RequestMethod {
  url: string;
  body?: RequestBody;
}

export type RequestBody = unknown;

export interface AirtableRecordRequest {
  baseId: string;
  tableId: string;
  atId?: string;
  body: RequestBody;
}

export interface UpdateAirtableRecordRequest {
  atId?: string;
  baseId: string;
  tableId: string;
  body?: RequestBody;
}

export interface RequestBodyWebsiteInfos {
  fields: unknown;
}

export type AirtableRecord<FieldsType> = {
  fields: FieldsType;
};

export type UpdateRecords<FieldsType> = AirtableRecord<FieldsType>[];

export type WebsiteRecordFields = {
  URL?: string | null;
  redirectUrl?: string | null;
  emails?: string | null;
  siteDescription?: string | null;
  URLs?: string[];
  status?: string;
  pagesVisited?: number;
  technology?: string[];
  technologyExternal?: string[];
  siteTitle?: string | null;
  Cookies?: string[];
  privacyPage?: string | null;
  errorMessage?: string | null;
  baseUrl?: string | null;
  Source?: string;
  Created?: string;
  "Status (URLs)"?: string[];
  Agentur?: string[];
  scrapeTime?: number;
  "Email Scrape"?: string;
  pageLimit?: number;
  clickElement?: string | null;
  sitemapsUrl?: string | null;
  sitemapSearch?: boolean;
  "delay (ms)"?: number;
  lastScrape?: string;
  scrapeStatus?: string | null;
};

export type CookieRecordFields = {
  Name?: string | null;
  Websites?: string[];
  Service?: string[];
  Status?: string;
  "validFor (days)"?: string | null;
  sameParty?: boolean;
  session?: boolean;
  value?: string | null;
  Error?: string | null;
  URLs?: string[];
  "validFor (minutes)"?: number | null;
  "Scripts (from Websites)"?: string[];
  "Projekt (from Websites)"?: string[];
  sameAs?: string[];
  summaryStatus?: string;
  descriptionStatus?: string;
};

export type UrlsRecordFields = {
  Name?: string | null;
  Status?: string[];
  Webseiten?: string[];
  Service?: string[];
  description?: string | null;
  category?: string[];
  summary?: string | null;
  publishStatus?: string;
  Subservice?: string[];
  summaryInput?: string | null;
  descriptionInput?: string | null;
  server?: string | null;
  setCookie?: string | null;
  setCookieAlt?: string | null;
  poweredBy?: string | null;
  via?: string | null;
  akamaiCacheStatus?: string | null;
  xCache?: string | null;
  xCacheAlt?: string | null;
  xAmzCfPop?: string | null;
  xAmzRid?: string | null;
  errorMessage?: string | null;
  cookies?: string[];
  cookiesJson?: string[];
  scripts?: string[];
  technologie?: string[];
  projekt?: string[];
};

export type UrlsFound = {
  name: string;
  foundOnUrls: string[];
}[];

export type ParsedItem = {
  name?: string;
  urls?: string[];
};

export type AirtableResponse<T> = {
  records: T[];
  error?: { message: string };
  offset?: string;
};

export type UpdateStatusArgs = {
  body: ScraperArgs;
  status: string;
  statusMessage?: string;
  errorMessage?: string;
};

type ScriptsAirtableRecord = {
  fields: ScriptsRecordFields;
};

export type ScriptsRecord = {
  id: string;
  createdTime: string;
  fields: ScriptsRecordFields;
};

export type ScriptsRecordFields = {
  url: string | null;
  scriptname: string | null;
  hostname: string[];
  pathname: string | null;
  server?: string[];
};
