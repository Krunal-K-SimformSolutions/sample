import * as Sentry from '@sentry/react-native';
import _ from 'lodash';
import { AppConst, StringConst } from '../constants';
import { getUserOrMemberName, logger } from '../utils';
import { getTranslatedString } from './TranslationConfig';
import type { User } from '../types';

/**
 * Initializes the Sentry client with the Sentry URL, the environment, and whether or not we're in debug mode..
 *
 * @returns {void} None
 */
export const initSentry = (): void => {
  if (!_.isEmpty(AppConst.sentryUrl) && !_.isEqual(AppConst.sentryUrl, 'NA')) {
    Sentry.init({
      dsn: AppConst.sentryUrl,
      environment: AppConst.isDevelopment ? 'development' : 'production',
      debug: AppConst.isDevelopment,
      // Adds more context data to events (IP address, cookies, user, etc.)
      // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
      sendDefaultPii: true,
      /**
       * Modifies or drops events before they are sent to Sentry.
       *
       * @param {Sentry.Event} event - The event to be sent to Sentry.
       * @param {Sentry.EventHint} hint - Additional information about the event.
       * @returns {Sentry.Event | null} The modified event or null to drop the event.
       */
      beforeSend: (event, hint) => {
        const error = hint.originalException;

        // Ignore specific error messages
        const ignoredErrors = [
          'Network request failed',
          'Non-Error promise rejection',
          'ResizeObserver loop limit exceeded',
          'Aborted',
          'Connection has been closed',
          'Previous request was cancelled due to a new request',
          'Error.stack getter called with an invalid receiver'
        ];

        logger.wtf('Sentry beforeSend', error);
        // @ts-expect-error - ignore specific error messages
        if (error && ignoredErrors.some((err) => error.message?.includes(err))) {
          return null; // Prevent this error from being reported
        }
        return event;
      }
    });
  }
};

const sensitivePatterns = ['password', 'pass', 'token', 'key', 'secret', 'auth'];

/**
 * Checks if a key is sensitive based on predefined patterns
 *
 * @param {string} key - the key to check
 * @returns {boolean} indicating if the key is sensitive
 */
const isSensitiveKey = (key: string): boolean => {
  return sensitivePatterns.some((pat) => key.toLowerCase().includes(pat));
};

/**
 * Mask sensitive substrings in a string
 *
 * @param {string} str - the string to mask
 * @returns {string} the masked string
 */
const maskSensitiveInString = (str: string): string => {
  let masked = str;
  for (const pat of sensitivePatterns) {
    const regex = new RegExp(pat, 'gi');
    masked = masked?.replace?.(regex, '********') ?? masked;
  }
  return masked;
};

/**
 * Try parsing JSON and recursively process it, otherwise mask string
 *
 * @param {string} str - the string to parse
 * @returns {string} processed string
 */
const tryParseJSON = (str: string): string => {
  try {
    const parsed = JSON.parse(str);
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    return JSON.stringify(reverseKeysDeep(parsed));
  } catch {
    return maskSensitiveInString(str);
  }
};

/**
 * Helper function to process each value
 *
 * @param {string} key - the key of the value
 * @param {any} value - the value to process
 * @returns {any} processed value
 */
const processValue = (key: string, value: any): any => {
  if (isSensitiveKey(key)) {
    return '********';
  }

  if (typeof value === 'string') {
    return tryParseJSON(value);
  }

  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  return reverseKeysDeep(value);
};

/**
 * Recursively randomizes the keys of an object by appending a short random suffix to each key.
 *
 * @param {any} obj - The object whose keys are to be randomized.
 * @returns {any} A new object with randomized keys.
 */
const reverseKeysDeep = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(reverseKeysDeep);
  }

  if (obj && typeof obj === 'object' && obj.constructor === Object) {
    const reversedObj: any = {};
    for (const [key, value] of Object.entries(obj)) {
      const reversedKey = key.split('').reverse().join('');
      reversedObj[reversedKey] = processValue(key, value);
    }
    return reversedObj;
  }

  return maskSensitiveInString(obj);
};

/**
 * Captures API errors and logs them to Sentry with custom details.
 *
 * @param {string} endpoint - The API endpoint that was called.
 * @param {ApiResponse<any> | null} response - The response object from the API call.
 * @param {unknown} error - The error message or object that was encountered.
 * @returns {void} None
 */
export const sentryCaptureAPIException = (
  endpoint: string | undefined,
  response: Record<string, any> | null,
  error: unknown
): void => {
  try {
    let errorMessage: string = getTranslatedString(StringConst.Common.errUnexpected);
    if (typeof error === 'string') {
      errorMessage = getTranslatedString(error, { defaultValue: error });
    } else if (error instanceof Error) {
      errorMessage = getTranslatedString(error?.message ?? '', {
        defaultValue: error?.message ?? ''
      });
    }

    const customError: Error = new Error(errorMessage);
    const strError = getTranslatedString(StringConst.Common.err);
    customError.name = endpoint ? `${strError}: ${endpoint}` : strError;

    const extraCustomError: Error = new Error(maskSensitiveInString(errorMessage ?? 'N/A'));
    const extraStrError = getTranslatedString(StringConst.Common.err);
    extraCustomError.name = maskSensitiveInString(
      endpoint ? `${extraStrError}: ${endpoint}` : extraStrError
    );

    const extra = {
      endpoint: maskSensitiveInString(endpoint ?? 'N/A'),
      errorMessage: maskSensitiveInString(errorMessage ?? 'N/A'),
      status: response?.status,
      response: JSON.stringify(reverseKeysDeep(response ?? {})),
      error: JSON.stringify(reverseKeysDeep(extraCustomError ?? {})),
      errorResponse: JSON.stringify(reverseKeysDeep(response?.data ?? {}))
    };
    logger.wtf('Sentry API Extra', extra);
    Sentry.captureException(customError, {
      extra
    });
  } catch (err) {
    logger.e('Sentry Capture Exception', err);
  }
};

/**
 * Captures an exception in Sentry.
 * If we're in development mode, log the error to the console, otherwise send it to Sentry
 *
 * @param {Error} error - the error to capture
 * @param {Record<string, unknown>} [extra] - additional context information to send with the error
 * @returns {void} None
 */
export const sentryCaptureException = (error: Error, extra?: Record<string, unknown>): void => {
  try {
    const hint: any = { extra };
    Sentry.captureException(error, hint);
  } catch (err) {
    logger.e('Sentry Capture Exception', err);
  }
};

/**
 * Sets the user information for Sentry.
 *
 * @param {UserResponse} user - the user information to set for Sentry.
 * @returns {void} None
 */
export const loginSentry = (user: User): void => {
  Sentry.setUser({
    id: user.email ?? '',
    email: user.email ?? '',
    username: getUserOrMemberName({
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      email: user.email ?? ''
    })
  });
};
