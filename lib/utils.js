import "dotenv/config.js";
import fs from "fs";
import path from "path";

/**
 * Delays execution for a specified number of milliseconds.
 * @param {number} ms - The number of milliseconds to delay.
 * @returns {Promise<void>} A promise that resolves after the delay.
 */
export function delay(ms = 0) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Merges two sets into one.
 * @param {Set<any>} set1 - The first set.
 * @param {Set<any>} set2 - The second set.
 * @returns {Set<any>} - The merged set.
 */
export function mergeSets(set1, set2) {
  const mergedSet = new Set(set1);
  for (const item of set2) {
    mergedSet.add(item);
  }
  return mergedSet;
}

/**
 * Merges two maps into one.
 * @param {Map<any, any>} map1 - The first map.
 * @param {Map<any, any>} map2 - The second map.
 * @returns {Map<any, any>} - The merged map.
 */
export function mergeMaps(map1, map2) {
  return new Map([...map1, ...map2]);
}

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

/**
 * Logs messages based on the environment variable LOG's value. If LOG is "CONSOLE",
 * the message is logged to the console. If LOG is "IPC_MESSAGE", the message is sent via IPC.
 * The message should be a string. If the 'showDate' option is true, each log entry is prefixed
 * with the current date and time.
 * @param {string} message - The message to log. Should be a string.
 * @param {object} [options] - Optional settings for logging.
 * @param {boolean} [options.showDate] - If true, prefixes the log entry with the current date and time.
 */
export function logging(message, options = { showDate: true }) {
  const logType = process.env.LOG;
  if (!logType) return;
  try {
    if (logType === "CONSOLE") {
      if (options.showDate === false) {
        console.log(message);
      } else {
        console.log(new Date().toISOString(), message);
      }
    } else if (logType === "IPC_MESSAGE" && process && process.send) {
      process.send({ log: `${new Date().toISOString()}: ${message}` });
    }
  } catch (error) {
    console.error(error);
  }
}

/**
 * Writes log messages to a file named 'scraper.log' in the current working directory.
 * It accepts any number of arguments of any type. Each argument is converted to a string.
 * For objects, JSON.stringify is used for conversion. Each log entry is prefixed with the current date and time.
 * @param {...any} params - The parameters to log. Can be of any type.
 */
export function logToFile(...params) {
  try {
    const logDir = "./.log";
    const logFile = path.join(logDir, "scraper.log");

    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");

    const timestamp = `${year}-${month}-${day}-${hours}:${minutes}:${seconds}`;
    const message = params
      .map((param) => {
        if (typeof param === "object") {
          return JSON.stringify(param, null, 2);
        }
        return String(param);
      })
      .join(" ");

    const logEntry = `${timestamp}: ${message}\n`;
    fs.appendFile(logFile, logEntry, (err) => {
      if (err) {
        console.error("Error writing to log file:", err);
      }
    });
  } catch (error) {
    console.error(error);
  }
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

/**
 * Calculates the duration in seconds between two dates.
 * @param {Date} startDate - The start date.
 * @param {Date} endDate - The end date.
 * @returns {number} The duration between the two dates in seconds.
 */
export function getDuration(startDate, endDate) {
  return (endDate.getTime() - startDate.getTime()) / 1000;
}
