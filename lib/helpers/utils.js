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
 * Writes log messages to a file named 'scraper.log' in the current working directory.
 * It accepts any number of arguments of any type. Each argument is converted to a string.
 * For objects, JSON.stringify is used for conversion. Each log entry is prefixed with the current date and time.
 * @param {...any} params - The parameters to log. Can be of any type.
 */
export function logToFile(...params) {
  try {
    const logFile = path.join(
      "./node",
      "scraper.log"
    );
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
