import _ from 'lodash';
import { RegexConst, StringConst } from '../constants';

/**
 * If the value is null or undefined, return true. Otherwise, return true if the string is empty or
 * contains only whitespace
 *
 * @param {string | undefined | null} value - The string to be checked.
 * @returns {boolean} A boolean value.
 */
export const isNullOrWhiteSpace = (value?: string | null): boolean => {
  try {
    if (_.isNil(value) || value === 'null' || value === 'undefined') {
      return true;
    }
    return value.toString().replace(RegexConst.stringClean, '').length < 1;
  } catch {
    return false;
  }
};

/**
 * "Given a number and a format template, return a string that is the number formatted to the
 * template."
 *
 * The function takes two parameters:
 *
 * input: number
 * formatTemplate: string
 * The function returns a string
 *
 * @param {number | null} [input] - The number to format
 * @param {string | null} [formatTemplate] - The format template to use.
 * @returns {string} A string
 */
export const formatNumber = (input?: number | null, formatTemplate?: string | null): string => {
  const count = formatTemplate?.length ?? 0;
  const stringValue = input?.toString() ?? '';
  if (count <= stringValue.length) {
    return stringValue;
  }

  let remainingCount = count - stringValue.length;
  remainingCount += 1; //Array must have an extra entry
  return new Array(remainingCount).join('0') + stringValue;
};

/**
 * It takes a string with placeholders in it, and replaces the placeholders with values from an object
 *
 * @param {string | null} [format] - The string to format.
 * @param {Record<string, any> | null} [args] - The arguments to be passed to the format string.
 * @returns {string} A string
 */
export const formatString = (format?: string | null, args?: Record<string, any> | null): string => {
  return (
    format?.toString()?.replace(RegexConst.stringArg, (match, x) => {
      //0
      const s = match.split(':');
      if (s.length > 1) {
        x = (s[0] ?? '').replace('{', '');
        match = (s[1] ?? '').replace('}', '');
      }

      const arg = args?.[x];
      if (_.isNil(arg) || RegexConst.stringFormat.exec(match)) {
        return arg;
      }
      if (
        (typeof arg === 'number' || !_.isNaN(arg)) &&
        !_.isNaN(+match) &&
        !isNullOrWhiteSpace(arg)
      ) {
        return formatNumber(arg, match);
      }
      return arg ?? '';
    }) ?? ''
  );
};

/**
 * Converts a hex color code to a hex color code with an opacity value.
 *
 * @param {string} hex - The hex color code (e.g., '#FFFFFF' or '#FFF').
 * @param {number} opacity - The opacity value between 0 and 1.
 * @returns {string} A hex color code with the opacity integrated (e.g., '#FFFFFF80').
 */
export const convertHexWithOpacity = (hex: string, opacity: number): string => {
  // Ensure hex starts with #
  hex = hex.replace(/^#/, '');

  // Expand shorthand hex (e.g., #FFF to #FFFFFF)
  if (hex.length === 3) {
    hex = hex
      .split('')
      .map((x) => x + x)
      .join('');
  }

  if (hex.length !== 6) return '';

  // Convert opacity (0-1) to 2-digit hex (00-FF)
  const alpha = Math.round(opacity * 255)
    ?.toString(16)
    ?.padStart(2, '0')
    ?.toUpperCase();

  // Return new hex with updated opacity
  return `#${hex.substring(0, 6)}${alpha}`;
};

/**
 * Converts a hex color code to a RGBA color string.
 *
 * @param {string} hex - The hex color code (e.g., '#FFFFFF' or '#FFF').
 * @param {number} [alpha=1] - The opacity value between 0 and 1.
 * @returns {string} A RGBA color string (e.g., 'rgba(255, 255, 255, 1)').
 */
export const convertHexToRgba = (hex: string, alpha: number = 1): string => {
  // Ensure hex starts with #
  hex = hex.replace(/^#/, '');

  // Expand shorthand hex (e.g., #FFF to #FFFFFF)
  if (hex.length === 3)
    hex = hex
      .split('')
      .map((char) => char + char)
      .join('');

  if (hex.length !== 6) return '';

  const r = Number.parseInt(hex.substring(0, 2), 16);
  const g = Number.parseInt(hex.substring(2, 4), 16);
  const b = Number.parseInt(hex.substring(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

/**
 * Function to get the file name from the file path
 *
 * @param {string} [filePath=''] - The full file path.
 * @returns {string} The file name with extension.
 */
export const getFileNameWithExtension = (filePath: string = ''): string => {
  return filePath?.substring(filePath?.lastIndexOf('/') + 1, filePath?.length) ?? '';
};

/**
 * Converts a local file path to a URL that can be used to open the file from the native file system.
 *
 * @param {string} [filePath=''] - The local file path to convert.
 * @returns {string} A URL that can be used to open the file from the native file system.
 */
export const getLocalFilePath = (filePath: string = ''): string => {
  // Check if the fileName is empty or undefined
  if (_.isEmpty(filePath)) {
    return '';
  }
  // Check if the fileName starts with 'file://'
  if (filePath.startsWith('file:///')) {
    return filePath; // Return as is if it already has 'file://' prefix
  }
  // Otherwise, prepend 'file://' to the fileName
  return `file:///${filePath}`;
};

/**
 * Get the member or user name from the object.
 *
 * @param {Partial<{ firstName: string; lastName: string; email: string; }>} root - The object containing user/member details.
 * @param {string} root.firstName - The first name of the user/member.
 * @param {string} root.lastName - The last name of the user/member.
 * @param {string} root.email - The email of the user/member.
 * @returns {string} The formatted name of the user/member.
 */
export const getUserOrMemberName = ({
  firstName = '',
  lastName = '',
  email = ''
}: Partial<{
  firstName: string;
  lastName: string;
  email: string;
}>): string => {
  if (!_.isEmpty(firstName) && !_.isEmpty(lastName)) {
    return `${_.upperFirst(firstName)} ${_.upperFirst(lastName)}`;
  } else if (!_.isEmpty(firstName)) {
    return _.upperFirst(firstName ?? StringConst.Common.dash);
  } else if (!_.isEmpty(lastName)) {
    return _.upperFirst(lastName ?? StringConst.Common.dash);
  } else if (!_.isEmpty(email)) {
    const namePart = email.split('@')[0];
    return _.upperFirst(namePart ?? StringConst.Common.dash);
  }
  return StringConst.Common.dash;
};

/**
 * Get First character of first two word.
 *
 * @param {Partial<{ url: string; firstName: string; lastName: string; email: string; isShowAsPlaceholder: boolean; }>} [root] - The object containing user/member details.
 * @param {string} root.url - The url of the user/member.
 * @param {string} root.firstName - The first name of the user/member.
 * @param {string} root.lastName - The last name of the user/member.
 * @param {string} root.email - The email of the user/member.
 * @param {boolean} root.isShowAsPlaceholder - A boolean indicating whether to show as placeholder.
 * @returns {string} The two character string for image placeholder.
 */
export const twoCharacterForImage = ({
  url = '',
  firstName = '',
  lastName = '',
  email = '',
  isShowAsPlaceholder = true
}: Partial<{
  url: string;
  firstName: string;
  lastName: string;
  email: string;
  isShowAsPlaceholder: boolean;
}>): string => {
  if (!_.isEmpty(url) || !isShowAsPlaceholder) {
    return '';
  } else if (!_.isEmpty(firstName) && !_.isEmpty(lastName)) {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`?.toUpperCase();
  } else if (!_.isEmpty(firstName)) {
    if (firstName?.includes(' ')) {
      const [first, second] = firstName.trim().split(/\s+/);
      return twoCharacterForImage({
        url,
        firstName: first ?? '',
        lastName: second ?? '',
        email,
        isShowAsPlaceholder
      });
    }
    return firstName.substring(0, 2)?.toUpperCase();
  } else if (!_.isEmpty(lastName)) {
    return lastName.substring(0, 2)?.toUpperCase();
  } else if (!_.isEmpty(email)) {
    const namePart = email.split('@')[0];
    return namePart?.substring(0, 2)?.toUpperCase() ?? '';
  }
  return '';
};

/**
 * Converts a category title from a raw string to a formatted string.
 *
 * @param {string} raw - The raw category title string.
 * @returns {string} The formatted category title string.
 */
export const formatCategoryTitle = (raw: string): string => {
  const lower = _.toLower(raw.replaceAll('_', ' ')); // replace _ with space and lowercase
  return _.upperFirst(lower); // capitalize only first character
};

/**
 * Gets the first clean word from a given input string.
 *
 * @param {string} input - The string to extract the first word from.
 * @returns {string} The first word of the input, or an empty string if the input is empty.
 */
export const getFirstCleanWord = (input: string): string => {
  const trimmed = _.trim(input);
  const firstWord = _.head(_.words(trimmed));
  return firstWord ?? '';
};

/**
 * Converts an input string to a properly formatted string.
 * The function trims whitespace, converts the string to lowercase,
 * and capitalizes the first character.
 *
 * @param {string | null} [input] - The input string to format.
 * @returns {string} The formatted string.
 */
export const formattedInputString = (input?: string | null): string => {
  if (_.isNil(input) || _.isEmpty(input)) {
    return '';
  }
  return input
    .trim()
    .toLowerCase()
    .split(RegexConst.splitSpaceSlash) // split by space or slash, keeping delimiters
    .filter(Boolean)
    .map((part) => {
      const match = RegexConst.splitWords.exec(part);
      return match ? part : (part.charAt(0)?.toUpperCase() ?? '') + part.slice(1);
    })
    .join('');
};
