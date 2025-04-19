/**
 * String utility functions.
 */

export const StringUtils = {
  /** Capitalizes the first character of a string. */
  capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  },

  /** Counts the amount of words (whitespace-delimited) in a string. */
  countWords(str: string): integer {
    // Source: https://www.geeksforgeeks.org/user/mansigeekso9ii/
    return (str.match(/\b\w+\b/g) || []).length;
  }
}