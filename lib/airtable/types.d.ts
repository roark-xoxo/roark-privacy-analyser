import type { ScraperArgsBody } from "../scraper/types.d.ts";

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
  body: ScraperArgsBody;
  status: string;
  statusMessage?: string;
  errorMessage?: string;
};
