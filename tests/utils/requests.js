import axios from "axios";

/**
 * @typedef {import('../../lib/scraper/types').ScraperArgsBody} ScraperArgsBody
 * @typedef {import('../../lib/scraper/types').ScraperArgsFeaturesType} ScraperArgsFeaturesType
 * @typedef {import('axios').AxiosResponse} AxiosResponse
 * @typedef {import('axios').AxiosError} AxiosError
 */

/**
 * Sends a POST request to the any privacy endpoint.
 * @param {object} params - The parameters for the request.
 * @param {string} params.url - The URL to be scraped.
 * @param {ScraperArgsFeaturesType} params.features - Features for the scraper.
 * @param {string} params.server - The server address.
 * @returns {Promise<AxiosResponse>} The response from the endpoint.
 * @since 1.0.0
 */
export async function privacyEndpointRequest({ url, features, server }) {
  /** @type {ScraperArgsBody} */
  const data = { scraper: { url, features } };
  const response = await axios.request({
    method: "POST",
    url: `${server}`,
    headers: {
      "Content-Type": "application/json",
      token: process.env.ROARK_API_KEY,
    },
    data,
  });
  return response.data;
}

/**
 * Sends a POST request to the local privacy endpoint.
 * @param {object} params - The parameters for the request.
 * @param {string} params.url - The URL to be scraped.
 * @param {ScraperArgsFeaturesType} params.features - Features for the scraper.
 * @returns {Promise<AxiosResponse>} The response from the endpoint.
 * @since 1.0.0
 */
export async function privacyEndpointRequestLocal({ url, features }) {
  return await privacyEndpointRequest({
    url,
    features,
    server: "http://127.0.0.1:8787",
  });
}

/**
 * Sends a POST request to the remote privacy endpoint.
 * @param {object} params - The parameters for the request.
 * @param {string} params.url - The URL to be scraped.
 * @param {ScraperArgsFeaturesType} params.features - Features for the scraper.
 * @returns {Promise<AxiosResponse>} The response from the endpoint.
 * @since 1.0.0
 */
export async function privacyEndpointRequestRemote({ url, features }) {
  return await privacyEndpointRequest({
    url,
    features,
    server: "https://privacy.roark.at",
  });
}
