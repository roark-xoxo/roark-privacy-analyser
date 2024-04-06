import { getScrapeResults } from "./lib/scrape.js";

(async () => {
  const data = await getScrapeResults("google.com");
  console.log(data);
})();
