/**
 * @typedef {import('../scraper/types.d.ts').ErrorResponse} ErrorResponse
 * @typedef {import('../scraper/types.d.ts').ScraperArgsBody} ScraperArgsBody
 * @typedef {import('../scraper/types.d.ts').SuccessResponse} SuccessResponse
 */

/**
 * Gets the message from an error object or string.
 * @param {unknown} error - The error to extract the message from.
 * @returns {string} The error message.
 */
export function getErrorMessage(error) {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "An unknown error occurred";
}

export const delay = async (ms = 0) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Constructs an error response object.
 * @param {ErrorResponse} res - The ErrorResponse object.
 * @returns {{ success: boolean, status: number, message: string }} An error response object.
 */
export function getErrorResponse(res) {
  return {
    success: false,
    status: res?.status ?? 500,
    message: getErrorMessage(res.error),
  };
}

/**
 * Constructs a success response object.
 * @param {SuccessResponse} res - The SuccessResponse object.
 * @returns {{ success: boolean, status: number, message: string|null, data: any }} A success response object.
 */
export function getSuccessResponse(res) {
  return {
    success: true,
    status: res?.status ?? 200,
    message: res?.message ?? null,
    data: res?.data ?? null,
  };
}

/**
 * Validates if the provided API token is valid.
 * @param {string} token - The Hono context.
 * @returns {boolean} True if the token is valid, false otherwise.
 */
export function isValidRoarkApiToken(token) {
  if (token && token === process.env.ROARK_API_KEY) return true;
  return false;
}

/**
 * Validates if the provided value is a boolean.
 * @param {unknown} value - The value to validate.
 * @returns {boolean} The boolean value, or false if invalid.
 */
export function validateBoolean(value) {
  return typeof value === "boolean" ? value : false;
}

/**
 * Validates if the provided value is a number.
 * @param {unknown} value - The value to validate.
 * @returns {number | null} The number value, or null if invalid.
 */
export function validateNumber(value) {
  return typeof value === "number" ? value : null;
}

/**
 * Validates if the provided value is a string.
 * @param {unknown} value - The value to validate.
 * @returns {string | null} The string value, or null if invalid.
 */
export function validateString(value) {
  return typeof value === "string" ? value : null;
}

/**
 * Validates the body arguments for Airtable.
 * @param {ScraperArgsBody} body - The body to validate.
 * @returns {boolean} True if the validation passes, throws an error otherwise.
 */
export function validateBodyAirtableArgs(body) {
  const { airtable } = body;
  if (!airtable) {
    throw new Error("No airtable args");
  }
  const { tableId, baseId, atId } = airtable;
  if (!tableId || !baseId || !atId) {
    throw new Error("No airtable args");
  }
  if (
    validateString(tableId) === null ||
    validateString(baseId) === null ||
    validateString(atId) === null
  ) {
    throw new Error("No airtable args");
  }
  return true;
}

/**
 * Trims a string to a maximum length.
 * @param {string} input - The string to trim.
 * @param {number} maxLen - The maximum length.
 * @returns {string} The trimmed string.
 */
export function trimToMax(input, maxLen = 91000) {
  if (input.length > maxLen) {
    return input.substring(0, maxLen);
  }
  return input;
}

/**
 * Returns a list of invalid file extensions.
 * @returns {string[]} An array of invalid file extensions.
 */
export function getInvalidExtensions() {
  return [
    ".pdf",
    ".vcf",
    ".zip",
    ".ics",
    ".jpg",
    ".jpeg",
    ".webp",
    ".avif",
    ".doc",
    ".docx",
    ".xls",
    ".ico",
    ".xlsx",
    ".ppt",
    ".jfif",
    ".pptx",
    ".txt",
    ".rtf",
    ".png",
    ".gif",
    ".bmp",
    ".tiff",
    ".mp3",
    ".wav",
    ".aac",
    ".svg",
    ".mp4",
    ".mov",
    ".wmv",
    ".rar",
    ".7z",
    ".exe",
    ".dll",
    ".sys",
    ".json",
    ".xml",
    ".csv",
    ".js",
    ".css",
    ".py",
    ".gz",
    ".asc",
  ];
}
