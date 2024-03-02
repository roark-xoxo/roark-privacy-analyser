import { ScraperArgsBody } from "../scraper/types.js";

export interface QueueItem extends ScraperArgsBody {
  running: boolean;
  dateStarted: Date | null;
}

export type CacheItem = { fileName: string; content: QueueItem };

export type WriteCacheFileProps = {
  fileName: string;
  content: ScraperArgsBody;
  running: boolean;
  dateStarted: Date | null;
};
