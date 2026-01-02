import { Linking, type DimensionValue } from 'react-native';
import _ from 'lodash';
import { getCountry, getCurrencies, getLocales, type Locale } from 'react-native-localize';
import { sentryCaptureException } from '../configs';
import { AppConst, StringConst } from '../constants';
import { globalMetrics, Themes } from '../themes';
import { isEmailFields, isPhoneFields } from './ValidationSchemaUtils';

/**
 * Retrieves the locale details, including the currency, for the current locale.
 *
 * @returns {Partial<Locale> & { currency?: string | undefined; country?: string; callingCode?: string; }>} The locale details with the currency.
 */
export const getLocaleDetail = (): Partial<Locale> & {
  currency: string | undefined;
  country?: string;
  callingCode?: string;
} => {
  const currentLocale = {
    ...getLocales()[0],
    country: getCountry(),
    currency: getCurrencies()[0],
    callingCode: '+1'
  };

  return currentLocale;
};

/**
 * Formats the given amount as currency using the current locale.
 *
 * @param {string} amount - the amount to be formatted
 * @param {string} [currency] - optional currency code to override the locale's currency
 * @returns {string} the formatted currency string
 */
export const toCurrencyFormat = (amount?: string, currency?: string): string => {
  const locale = getLocaleDetail();
  const formatter = new Intl.NumberFormat(locale.languageTag, {
    style: 'currency',
    currency: currency ?? locale.currency,
    maximumFractionDigits: 0,
    minimumFractionDigits: 0
  });
  if (_.isEmpty(amount)) return formatter.format(Number(0));
  const value = amount;
  return formatter.format(Number(value));
};

/**
 * Trigger a native action on a given URL.
 *
 * @param {string} url - the URL to be opened
 * @param {string} [fallbackUrl] - optional fallback URL if the primary URL cannot be opened
 * @returns {void} None
 */
const triggerActions = (url: string, fallbackUrl?: string): void => {
  Linking.canOpenURL(url)
    .then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else if (!_.isNil(fallbackUrl) && !_.isEmpty(fallbackUrl)) {
        triggerActions(fallbackUrl);
      } else {
        ToastHolder.toastMessage({
          text2: StringConst.Common.errUrlNotSupported,
          type: ToastType.error
        });
      }
    })
    .catch((err) => {
      sentryCaptureException(err);
      ToastHolder.toastMessage({
        text2: err.message ?? StringConst.Common.errUrlNotOpened ?? '',
        type: ToastType.error
      });
    });
};

/**
 * Categories for inferring the type of action to be performed.
 *
 * 'phone' - for phone numbers
 * 'email' - for email addresses
 * 'url' - for web URLs
 */
type Category = 'phone' | 'email' | 'url';

/**
 * Infers the category of a given string value.
 *
 * @param {string} value - the string value to be checked
 * @returns {Category | undefined} the inferred category or undefined if no category is matched
 */
const inferCategory = (value: string): Category | undefined => {
  if (isEmailFields(value)) return 'email';
  if (isPhoneFields(value)) return 'phone';
  if (value.startsWith('http://') || value.startsWith('https://')) return 'url';
  return undefined;
};

/**
 * Constructs a mailto URL with optional subject and body parameters.
 *
 * @param {string} value - the email address
 * @param {string} [subject] - optional subject for the email
 * @param {string} [body] - optional body for the email
 * @returns {string} the constructed mailto URL string
 */
const buildEmailUrl = (value: string, subject?: string, body?: string): string => {
  let params = '';
  if (!_.isEmpty(subject) && !_.isEmpty(body)) {
    params = `?subject=${encodeURIComponent(subject ?? '')}&body=${encodeURIComponent(body ?? '')}`;
  } else if (!_.isEmpty(subject)) {
    params = `?subject=${encodeURIComponent(subject ?? '')}`;
  } else if (!_.isEmpty(body)) {
    params = `?body=${encodeURIComponent(body ?? '')}`;
  }
  return `mailto:${value}${params}`;
};

/**
 * Constructs a URL that can be used to make a phone call from a native app.
 *
 * @param {string} value - the phone number to be called
 * @returns {string} the constructed URL string
 */
const buildPhoneUrl = (value: string): string => {
  return globalMetrics.isIos ? `telprompt:${value}` : `tel:${value}`;
};

/**
 * Constructs a URL that can be used to make a phone call from a native app.
 *
 * @param {string} value - the URL string to be checked and potentially modified
 * @returns {string} the constructed URL string
 */
const buildUrl = (value: string): string => {
  return value.startsWith('market://') ||
    value.startsWith('http://') ||
    value.startsWith('https://')
    ? value
    : `http://${value}`;
};

/**
 * Call native actions based on given category and value.
 *
 * @param {string} value the value related to the category
 * @param {Object} [option] - optional parameters
 * @param {Category} [option.category] - the category of action to be performed
 * @param {string} [option.subject] - subject for email category
 * @param {string} [option.body] - body for email category
 * @param {string} [option.fallbackUrl] - fallback URL if the primary action cannot be performed
 * @returns {void} None
 *
 * @example
 * callActions('123456789', 'phone'); // Opens the native phone app with the number 123456789
 * callActions('john.doe@example.com', 'email'); // Opens the native email app with the email john.doe@example.com
 * callActions('https://example.com', 'url'); // Opens the native web browser with the URL https://example.com
 */
export const callActions = (
  value: string,
  option?: Partial<{
    category: Category;
    subject: string;
    body: string;
    fallbackUrl: string;
  }>
): void => {
  if (_.isEmpty(value)) return;
  const category = option?.category ?? inferCategory(value);

  if (_.isEqual(category, 'url')) {
    const url = buildUrl(value);
    triggerActions(url, option?.fallbackUrl);
  } else if (_.isEqual(category, 'email')) {
    const emailUrl = buildEmailUrl(value, option?.subject, option?.body);
    triggerActions(emailUrl, option?.fallbackUrl);
  } else if (_.isEqual(category, 'phone')) {
    const phoneUrl = buildPhoneUrl(value);
    triggerActions(phoneUrl, option?.fallbackUrl);
  } else {
    triggerActions(value, option?.fallbackUrl);
  }
};

/**
 * Returns the given string value, or an empty string if the value is nil or
 * undefined.
 *
 * @param {string} [value] - the string value to be checked
 * @returns {string} the string value or an empty string
 */
export const getStringValue = (value?: string): string => {
  return value ?? '';
};

/**
 * Returns the given number value, or 0 if the value is nil or undefined.
 *
 * @param {number} [value] - the number value to be checked
 * @returns {number} the number value or 0
 */
export const getNumberValue = (value?: number): number => {
  return value ?? 0;
};

/**
 * A helper function that returns the numeric value of a given dimension value.
 * If the given value is a number, it is returned as is.
 *
 * @param {DimensionValue} [value] - the dimension value to be converted
 * @returns {number} the numeric value of the dimension
 */
export const getNumericDimensionValue = (value?: DimensionValue): number => {
  if (value && typeof value === 'number') {
    return value;
  }
  if (value && typeof value === 'string' && value.endsWith('%')) {
    const percent = Number.parseFloat(value.replace('%', ''));
    const pxValue = (globalMetrics.screenHeight * percent) / 100;
    return pxValue;
  }
  return Themes.sizes.SS_50;
};

/**
 * Safely merges two objects. If the second object is undefined, returns the first object.
 *
 * @param {object} a - the first object
 * @param {object} [b] - the second object
 * @returns {object} the merged object
 */
export const safeMerge = (a: object, b?: object): object => {
  if (b) {
    return Object.assign(a, b);
  }
  return a;
};

/**
 * Returns a promise that resolves or rejects with the same value as the
 * original promise, unless the original promise takes longer than `ms`
 * milliseconds to resolve or reject, in which case the promise returned
 * by `timeout` rejects with a `Error` object with a message of
 * `timeoutMessage`.
 *
 * @param {Promise<T>} promise - the original promise
 * @param {number} ms - the timeout duration in milliseconds
 * @param {string} timeoutMessage - the timeout error message
 * @returns {Promise<T>} a promise that resolves or rejects with the same value as the original promise, or rejects with a timeout error
 */
export const asyncTimeout = <T>(
  promise: Promise<T>,
  ms: number = AppConst.asyncTimeout,
  timeoutMessage: string = ''
): Promise<T> => {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(timeoutMessage)), ms);

    promise
      .then((res) => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      })
      .finally(() => {
        clearTimeout(timer);
      });
  });
};
