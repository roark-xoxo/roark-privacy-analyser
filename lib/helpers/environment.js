/**
 * Determines the appropriate endpoint URL based on the environment.
 * @returns {string} The URL of the endpoint, differing between development and production environments.
 */
export function getEndpointUrl() {
  return isDevEnv() ? 'http://localhost:3000' : 'https://roark.at';
}

/**
 * Checks if the current environment is a development environment.
 * @returns {boolean} True if the environment is development, false otherwise.
 */
export function isDevEnv() {
  return process.env.NODE_ENV === 'development';
}
