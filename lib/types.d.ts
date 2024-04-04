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
  headless?: boolean;
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

export type SingleLineText = string | null;
export type MultilineText = string | null;
export type RichText = string;
export type SingleSelect = string;
export type MultipleSelects = string[];
export type MultipleLookupValues = string[];
export type Checkbox = boolean;
export type AirtableUrl = string | null;
export type AirtableEmail = string;
export type AirtableInteger = number | null;
export type Count = number;
export type Duration = number;
export type Formula = string | string[] | number;
export type MultipleRecordLinks = string[];
export type MultipleAttachments = Attachment[];
export type FormulaSingleReturn = string | number;
export type Rollup = string | number;
export type AutoNumber = number;
export type AirtableButton = {
  label: string;
  url: string;
};
export type LastModifiedTime = string;
export type CreatedTime = string;
export type DateTime = string;
export type PhoneNumber = string;
export type Currency = number;
export type Percent = number;

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
  Name?: Formula;
  URL?: AirtableUrl;
  redirectUrl?: AirtableUrl;
  emails?: MultilineText;
  siteDescription?: SingleLineText;
  URLs?: MultipleRecordLinks;
  Land?: SingleSelect;
  status?: SingleSelect;
  Branche?: MultipleSelects;
  Kontaktperson?: SingleLineText;
  pagesVisited?: number;
  technology?: MultipleRecordLinks;
  technologyExternal?: MultipleRecordLinks;
  siteTitle?: SingleLineText;
  Cookies?: MultipleRecordLinks;
  privacyPage?: MultilineText;
  pagesVisitedString?: MultilineText;
  cookiesFoundOn?: MultilineText;
  urlsFoundOn?: MultilineText;
  Telefon?: PhoneNumber;
  Adresse?: MultilineText;
  Öffnungszeiten?: MultilineText;
  lastModified?: LastModifiedTime;
  Kontaktstatus?: SingleSelect;
  errorMessage?: MultilineText;
  baseUrl?: SingleLineText;
  Bundesland?: SingleSelect;
  Partei?: SingleSelect;
  "Beruflicher Hintergrund"?: SingleLineText;
  Geburtsjahr?: number;
  Source?: SingleSelect;
  Created?: CreatedTime;
  Parteiseite?: AirtableUrl;
  "Status (URLs)"?: MultipleLookupValues;
  "Count (Cookies)"?: Count;
  Agentur?: MultipleRecordLinks;
  "Beruflicher Hintergrund copy"?: MultipleSelects;
  Kunden?: MultipleRecordLinks;
  "Count (URLs)"?: Count;
  scrapeTime?: Duration;
  "Email Scrape"?: AirtableEmail;
  Fachgebiet?: MultipleSelects;
  "Status (from Technology)"?: MultipleLookupValues;
  "Status (from Cookies)"?: MultipleLookupValues;
  "Count Evil URLs"?: Count;
  "Count Evil Technology"?: Count;
  "Count Evil Cookies"?: Count;
  "Evil Score"?: Formula;
  pageLimit?: number;
  atId?: Formula;
  clickElement?: SingleLineText;
  sitemapsUrl?: SingleLineText;
  sitemapSearch?: Checkbox;
  "delay (ms)"?: number;
  Scripts?: MultipleRecordLinks;
  lastScrape?: DateTime;
  Projekt?: MultipleSelects;
  scrapeStatus?: string | null;
};

export type CookieRecordFields = {
  Name?: SingleLineText;
  Websites?: MultipleRecordLinks;
  "Count (Websites)"?: Count;
  Service?: MultipleRecordLinks;
  Status?: SingleSelect;
  Kategorie?: MultipleSelects;
  Summary?: MultilineText;
  Description?: RichText;
  summaryLen?: Formula;
  descriptionLen?: Formula;
  writeSummary?: Checkbox;
  writeDescription?: Checkbox;
  Slug?: SingleLineText;
  "validFor (days)"?: SingleLineText;
  sameParty?: Checkbox;
  session?: Checkbox;
  value?: SingleLineText;
  Urteile?: MultipleRecordLinks;
  DSGVO?: MultipleRecordLinks;
  servicesJson?: MultipleLookupValues;
  json?: Formula;
  Error?: SingleLineText;
  URLs?: MultipleRecordLinks;
  lastModified?: LastModifiedTime;
  "validFor (minutes)"?: AirtableInteger;
  days?: Formula;
  "Scripts (from Websites)"?: MultipleLookupValues;
  "Projekt (from Websites)"?: MultipleLookupValues;
  Klassifikation?: MultipleSelects;
  sameAs?: MultipleRecordLinks;
  atId?: Formula;
  summaryStatus?: SingleSelect;
  descriptionStatus?: SingleSelect;
  "Count (Websites) Projekt Ärzte Wien"?: Count;
};

export type UrlsRecordFields = {
  Name?: SingleLineText;
  Status?: MultipleSelects;
  Webseiten?: MultipleRecordLinks;
  webseitenCount?: Count;
  Service?: MultipleRecordLinks;
  description?: MultilineText;
  category?: MultipleSelects;
  summary?: MultilineText;
  descriptionLen?: Formula;
  summaryLen?: Formula;
  publishStatus?: SingleSelect;
  Subservice?: MultipleRecordLinks;
  slug?: SingleLineText;
  summaryInput?: SingleLineText;
  descriptionInput?: SingleLineText;
  json?: Formula;
  server?: SingleLineText;
  setCookie?: SingleLineText;
  setCookieAlt?: SingleLineText;
  poweredBy?: SingleLineText;
  via?: SingleLineText;
  akamaiCacheStatus?: SingleLineText;
  xCache?: SingleLineText;
  xCacheAlt?: SingleLineText;
  xAmzCfPop?: SingleLineText;
  xAmzRid?: SingleLineText;
  errorMessage?: SingleLineText;
  cookies?: MultipleRecordLinks;
  servicesJson?: MultipleLookupValues;
  cookiesJson?: MultipleLookupValues;
  scripts?: MultipleRecordLinks;
  lastModified?: LastModifiedTime;
  technologie?: MultipleRecordLinks;
  projekt?: MultipleLookupValues;
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
  url: SingleLineText;
  scriptname: SingleLineText;
  hostname: MultipleRecordLinks;
  pathname: SingleLineText;
  server?: MultipleRecordLinks;
};
