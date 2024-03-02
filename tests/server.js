import { getErrorMessage } from "../lib/helpers/validation.js";
import { privacyEndpointRequestLocal } from "./utils/requests.js";

/**
 * Runs several server tests.
 * @returns {Promise<void>} void
 * @since 1.0.0
 */
async function tests() {
  await basicTests();
  // await testsChaos();
}

/**
 * Runs several server tests.
 * @returns {Promise<void>} void
 * @since 1.0.0
 */
async function basicTests() {
  const urls = ["google.com"];
  for (const url of urls) {
    console.log("Started basicTests for:", url);
    try {
      const response = await privacyEndpointRequestLocal({
        url,
        features: {
          engine: "both",
          pageLimit: 1,
          waitUntil: "load",
          log: true,
        },
      });
      console.log(url, JSON.parse(response?.message));
    } catch (error) {
      console.error("ERROR", url, getErrorMessage(error));
    } finally {
      console.log("Finished basicTests for:", url);
    }
  }
}

/**
 * Runs several server tests.
 * @returns {Promise<void>} void
 * @since 1.0.0
 */
async function testsChaos() {
  const urls = [
    "brightonfestival.org",
    "hfg-karlsruhe.de/",
    "adk-bw.de",
    "hfph.de",
    "kh-berlin.de",
  ];
  for (const url of urls) {
    console.log("Started testsChaos for:", url);
    try {
      const response = await privacyEndpointRequestLocal({
        url,
        features: {
          engine: "both",
          pageLimit: 1,
          waitUntil: "load",
          log: true,
        },
      });
      console.log(url, JSON.parse(response?.message));
    } catch (error) {
      console.error("ERROR", url, getErrorMessage(error));
    } finally {
      console.log("Finished testsChaos for:", url);
    }
  }
}

tests();
