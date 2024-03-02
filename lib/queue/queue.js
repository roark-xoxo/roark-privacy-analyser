import fs from "fs/promises";
import path from "path";
import {
  updateScrapeResultsOnAirtable,
  updateStatusOnAirtable,
} from "../airtable/privacy-records.js";
import {
  getErrorMessage,
  getErrorResponse,
  getSuccessResponse,
} from "../helpers/validation.js";
import { logToFile } from "../helpers/utils.js";

/**
 *
 * @typedef {import('../scraper/types.d.ts').ScraperArgsBody} ScraperArgsBody
 * @typedef {import('./types.d.ts').CacheItem} CacheItem
 * @typedef {import('./types.d.ts').QueueItem} QueueItem
 * @typedef {import('./types.d.ts').WriteCacheFileProps} WriteCacheFileProps
 */

/**
 * Add to queue
 * @param {ScraperArgsBody} body - The parameters for the function.
 * @since 1.0.0
 */
export const addToQueue = async (body) => {
  if (!body?.airtable?.atId) return;
  logToFile(body.scraper.url, "added to queue");
  try {
    await updateStatusOnAirtable({
      status: "addedToQueue",
      statusMessage: "addedToQueue",
      body,
    });
  } catch (error) {
    logToFile("fn_addToQueue - updateStatusOnAirtable", getErrorMessage(error));
  }
  const priority = body.scraper.features?.queuePriority ?? null;
  let fileName = Date.now() + "_" + body.airtable.atId + ".json";

  if (body.scraper.features?.queuePriority) {
    if (priority === 5) fileName = `0_1_${fileName}`;
    else if (priority === 4) fileName = `0_2_${fileName}`;
    else if (priority === 3) fileName = `0_3_${fileName}`;
    else if (priority === 2) fileName = `0_4_${fileName}`;
    else if (priority === 1) fileName = `0_5_${fileName}`;
  }

  await writeCacheFile({
    fileName,
    content: body,
    running: false,
    dateStarted: null,
  });

  return;
};

/**
 * Asynchronously resets the queue by creating a cache directory (if it doesn't exist),
 * reading all files in the cache, and resetting the cache items to their initial state.
 * @async
 * @function resetQueue
 * @returns {Promise<void>}
 * @since 1.0.0
 */
export async function resetQueue() {
  try {
    await fs.mkdir(getCachePath(), { recursive: true });
    const files = await fs.readdir(getCachePath());

    for (const file of files) {
      try {
        const content = await fs.readFile(
          path.join(getCachePath(), file),
          "utf-8"
        );
        /** @type {QueueItem} */
        const cache = JSON.parse(content);
        await writeCacheFile({
          fileName: file,
          content: cache,
          running: false,
          dateStarted: null,
        });
      } catch (innerError) {
        logToFile(innerError);
      }
    }

    logToFile("Queue reset");
  } catch (error) {
    logToFile(error);
  }
}

/**
 * Starts processing the queue by getting items to scrape from the cache
 * and updating their status on Airtable.
 * @async
 * @function startQueue
 * @returns {Promise<any>} - Response indicating the operation result.
 * @since 1.0.0
 */
export async function startQueue() {
  try {
    const items = await getItemsToScrapeFromCache();
    const promises = [];

    for (const { fileName, content } of items) {
      promises.push(
        writeCacheFile({
          fileName,
          content,
          running: true,
          dateStarted: new Date(),
        })
      );
      promises.push(updateScrapeResultsOnAirtable(content, fileName));
    }

    void Promise.allSettled(promises);

    return getSuccessResponse({
      message: `${items.length} added to queue`,
    });
  } catch (error) {
    return getErrorResponse({ error });
  }
}

/**
 * Retrieves the path for the cache directory.
 * This function constructs the cache path by joining the current working directory
 * with the '.cache/queue' directory.
 * @function getCachePath
 * @returns {string} - The full path to the cache directory.
 * @since 1.0.0
 */
function getCachePath() {
  return path.join(process.cwd(), ".cache", "queue");
}

/**
 * Writes a cache file with provided content.
 * @async
 * @function writeCacheFile
 * @param {WriteCacheFileProps} props - Properties for writing the cache file.
 * @returns {Promise<CacheItem>} - returns cache item
 * @since 1.0.0
 */
export async function writeCacheFile({
  fileName,
  content,
  running,
  dateStarted,
}) {
  /** @type {QueueItem} */
  const cache = { ...content, running, dateStarted };
  await fs.mkdir(getCachePath(), { recursive: true });
  await fs.writeFile(
    path.join(getCachePath(), fileName),
    JSON.stringify(cache)
  );
  return { fileName, content: cache };
}

/**
 * Retrieves items to be scraped from the cache.
 * @async
 * @function getItemsToScrapeFromCache
 * @returns {Promise<CacheItem[]>} - Array of cache items to scrape.
 * @since 1.0.0
 */
export async function getItemsToScrapeFromCache() {
  const MAX_ITEMS_LIMIT = 6;
  const files = (await fs.readdir(getCachePath())).sort();

  await resetItemsRunningTooLong(files);
  /** @type {Map<string, QueueItem>} */
  const fileContents = new Map();
  let runningCount = 0;
  for (const file of files) {
    const content = await getFileContentFromCache(file);
    if (!content) continue;
    fileContents.set(file, content);
    if (content.running) runningCount++;
  }
  /** @type {CacheItem[]} */
  const items = [];
  let index = 0;
  for (const file of files) {
    const content = fileContents.get(file);
    if (!content || content.running) continue;
    const item = { fileName: file, content };
    if (content.scraper?.features?.queuePriority === 5) {
      items.unshift(item);
    } else {
      if (index >= MAX_ITEMS_LIMIT - runningCount) break;
      items.push(item);
      index++;
    }
  }

  return items;
}

/**
 * Resets items that have been running too long in the cache.
 * @async
 * @function resetItemsRunningTooLong
 * @param {string[]} files - List of file names in the cache.
 * @returns {Promise<void>}
 * @since 1.0.0
 */
async function resetItemsRunningTooLong(files) {
  const RUNNING_LIMIT = 1000 * 60 * 60 * 12;
  const now = new Date();
  for (const file of files) {
    const content = await getFileContentFromCache(file);
    if (!content) continue;
    if (!content?.dateStarted) continue;
    const dateStarted = new Date(content.dateStarted);
    if (now.getTime() - dateStarted.getTime() > RUNNING_LIMIT) {
      await writeCacheFile({
        fileName: file,
        content: content,
        running: false,
        dateStarted: null,
      });
    }
  }
}

/**
 * Retrieves the content of a file from the cache.
 * @async
 * @function getFileContentFromCache
 * @param {string} fileName - Name of the file to retrieve content from.
 * @returns {Promise<QueueItem | null>} - Content of the file or null.
 * @since 1.0.0
 */
export async function getFileContentFromCache(fileName) {
  try {
    const content = await fs.readFile(
      path.join(getCachePath(), fileName),
      "utf-8"
    );
    return JSON.parse(content);
  } catch (err) {
    logToFile(err);
    return null;
  }
}

/**
 * Removes a file from the cache.
 * @async
 * @function removeFromCache
 * @param {string} fileName - The name of the file to be removed.
 * @returns {Promise<void>}
 * @since 1.0.0
 */
export async function removeFromCache(fileName) {
  try {
    await fs.unlink(path.join(getCachePath(), fileName));
  } catch (err) {
    logToFile(err);
    return;
  }
}

/**
 * Removes items from the queue based on provided identifiers.
 * @async
 * @function removeFromQueue
 * @param {object} c - The context containing request information.
 * @returns {Promise<any>} - Response indicating the operation result.
 * @since 1.0.0
 */
export async function removeFromQueue(c) {
  try {
    const ids = c.req.queries("id");
    if (!ids) {
      throw new Error("No id(s) provided");
    }

    let removedFiles = 0;
    const files = await fs.readdir(getCachePath());

    for (const id of ids) {
      for (const file of files) {
        if (file.includes(id)) {
          try {
            await fs.unlink(path.join(getCachePath(), file));
            removedFiles++;
          } catch (error) {
            continue;
          }
        }
      }
    }

    return getSuccessResponse({
      message:
        removedFiles > 0
          ? `${removedFiles} items have been successfully removed from queue`
          : "No item was removed from queue",
    });
  } catch (error) {
    return getErrorResponse({ error });
  }
}
