/**
 * Calculates number of days from current to the specified date.
 * @param {Date} date - The date to calculate the delta for.
 * @returns {number} Difference in days between now and specified date.
 */
export function getDaysDelta(date) {
  const difference = date.getTime() - new Date().getTime();
  return Math.ceil(difference / (1000 * 3600 * 24));
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
