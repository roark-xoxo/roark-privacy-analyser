/**
 * @typedef {import('playwright').Page} Page
 * @typedef {import('puppeteer').Page} PagePuppeteer
 * @typedef {import('./types').RequestOrResponseHeaders} RequestOrResponseHeaders
 * @typedef {import('./types').TechStack} TechStack
 * @typedef {import('./types').CollectedData} CollectedData
 * @typedef {import('./types.browser').HTMLMetaElementBrowser} HTMLMetaElementBrowser
 */

/**
 * Adds technology stack information from headers.
 * @param {RequestOrResponseHeaders} headers - Headers from a request or response.
 * @param {TechStack} data - The tech stack to be updated.
 * @since 0.1.0
 */
export const addTechStackFromHeader = (headers, data) => {
  const string = JSON.stringify(headers).toLowerCase();

  if (string.includes("x-amz-cf-pop") || string.includes("cloudfront")) {
    data.add("CloudFront");
  }
  if (string.includes("akamai")) {
    data.add("Akamai");
  }
  if (string.includes("uploadserver")) {
    data.add("Google Cloud Storage");
  }
  if (string.includes("cloudflare")) {
    data.add("cloudflare");
  }

  if (headers?.server) {
    const server = headers.server.toLowerCase();

    if (server.includes("ecacc (")) {
      data.add("ECAcc");
    } else if (server.includes("ecs (")) {
      data.add("ECS");
    } else if (server.includes("apache/")) {
      data.add("Apache");
    } else if (server.includes("bunnycdn-")) {
      data.add("BunnyCDN");
    } else if (server.includes("Cookie First CDN")) {
      data.add("Cookie First CDN");
    } else if (server.includes("microsoft-iis")) {
      data.add("Microsoft-IIS");
    } else if (server.startsWith("nginx")) {
      data.add("nginx");
    } else {
      data.add(headers.server);
    }
  }

  if (headers?.["x-powered-by"]) {
    const poweredBy = headers["x-powered-by"].toLowerCase();
    if (poweredBy.startsWith("php/")) {
      data.add("PHP");
    } else {
      data.add(headers?.["x-powered-by"]);
    }
  }

  if (headers?.via) {
    const via = headers.via.toLowerCase();
    if (via.includes("cloudfront")) {
      data.add("CloudFront");
    } else {
      data.add(headers.via);
    }
  }
};

/**
 * Retrieves privacy page links from internal links.
 * @param {CollectedData} data - Collected data including internal links.
 * @returns {string[]} Array of privacy page links.
 * @since 0.1.0
 */
export const getPrivacyPageLinks = (data) => {
  /** @type {Set<string>}  */
  const privacyPages = new Set();
  const words = [
    "datenschutz",
    "privacy",
    "impressum",
    "imprint",
    "cookie",
    "dsgvo",
    "gdpr",
    "legal",
  ];

  for (const link of data.internalLinks) {
    try {
      const url = new URL(link[0]);
      const pathname = url.pathname;
      for (const word of words) {
        if (pathname.includes(word)) {
          privacyPages.add(link[0]);
        }
      }
    } catch (_e) {
      /* empty */
    }
  }

  return Array.from(privacyPages);
};

/**
 * Extracts meta information from a webpage using Playwright.
 * @param {Page} page - The Playwright page object.
 * @param {CollectedData} data - The object where page metadata will be stored.
 * @returns {Promise<void>}
 * @since 0.1.0
 */
export const getPageMeta = async (page, data) => {
  data.pageTitle = await page.title();
  const metaContent = await page.$$eval(
    "meta",
    /**
     * @param {HTMLMetaElementBrowser[]} elements - Array of HTML meta elements.
     * @returns {Array<{name: string, content: string} | null>} Array of meta tag information.
     */
    (elements) => {
      return elements.map((meta) => {
        if (!meta?.name || !meta?.content) return null;
        return { name: meta.name, content: meta.content };
      });
    }
  );
  for (const meta of metaContent) {
    if (!meta) continue;
    if (meta.name === "description") data.pageDescription = meta.content;
    if (meta.name === "next-head-count") data.techStack.internal.add("Next.js");
    if (meta.name === "generator") {
      const generator = meta.content.toLowerCase();
      if (generator.includes("wordpress"))
        data.techStack.internal.add("WordPress");
      if (generator.includes("wpml ")) data.techStack.internal.add("WPML");
      if (generator.includes("woocommerce "))
        data.techStack.internal.add("WooCommerce");
      if (generator.includes("windows-azure-blob"))
        data.techStack.internal.add("Windows-Azure-Blob");
      if (generator.includes("windows-azure-blob"))
        data.techStack.internal.add("Windows-Azure-Blob");
      if (generator.includes("typo3 ")) data.techStack.internal.add("TYPO3");
      if (generator.includes("site kit by google"))
        data.techStack.internal.add("Site Kit by Google");
      if (generator.includes("siquando "))
        data.techStack.internal.add("Siquando Web");
      if (generator.includes("redux ")) data.techStack.internal.add("Redux");
      if (generator.includes("divi "))
        data.techStack.internal.add("Divi Theme");
      if (generator.includes("php/")) data.techStack.internal.add("PHP");
      if (generator.includes("pepyaka/"))
        data.techStack.internal.add("Pepyaka");
      if (generator.includes("joomla")) data.techStack.internal.add("Joomla");
      if (generator.includes("elementor"))
        data.techStack.internal.add("Elementor");
      else {
        data.techStack.internal.add(meta.content);
      }
    }
  }
};

/**
 * Extracts meta information from a webpage using Puppeteer.
 * @param {PagePuppeteer} page - The Puppeteer page object.
 * @param {CollectedData} data - The object where page metadata will be stored.
 * @returns {Promise<void>}
 * @since 0.1.0
 */
export const getPageMetaPuppeteer = async (page, data) => {
  data.pageTitle = await page.title();
  const metaContent = await page.$$eval(
    "meta",
    /**
     * @param {HTMLMetaElementBrowser[]} elements - Array of HTML meta elements.
     * @returns {Array<{name: string, content: string} | null>} Array of meta tag information.
     */
    (elements) => {
      return elements.map((meta) => {
        if (!meta?.name || !meta?.content) return null;
        return { name: meta.name, content: meta.content };
      });
    }
  );
  for (const meta of metaContent) {
    if (!meta) continue;
    if (meta.name === "description") data.pageDescription = meta.content;
    if (meta.name === "generator") data.techStack.internal.add(meta.content);
    if (meta.name === "next-head-count") data.techStack.internal.add("Next.js");
  }
};
