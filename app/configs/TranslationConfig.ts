import i18n, { type LanguageDetectorAsyncModule, type TOptions } from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'react-native-localize';
import { AppConst, StorageKeyConst } from '../constants';
import translations from '../translations';
import { getStorageItem, setStorageItem } from '../utils';

const LANGUAGE_DETECTOR: LanguageDetectorAsyncModule = {
  type: 'languageDetector',
  async: true,
  /**
   * Detects the language.
   *
   * @param {function(string): void} callback - a callback function that takes the language as an argument.
   * @returns {void} None
   */
  detect: (callback: (language: string) => void): void => {
    const deviceLang = getLocales()[0]?.languageCode;
    const language = getStorageItem(StorageKeyConst.appLanguage, deviceLang ?? 'en');
    callback(language);
  },
  /**
   * Initializes the language detector. Currently, this function does not
   * perform any operations, but is provided to comply with the detector's
   * interface.
   *
   * @returns {void} None
   */
  init: (): void => {},
  /**
   * Caches the user's language preference.
   *
   * @param {string} language - The language code to be stored as the user's preference.
   * @returns {void} None
   */
  cacheUserLanguage: (language: string): void => {
    setStorageItem(StorageKeyConst.appLanguage, language);
  }
};

/**
 * Initializes the i18n library.
 *
 * @param {object} - The key pair value to initialize the library. An object with the following properties:
 * - init: Function.prototype - proto type of function to initialize
 * - type: 'languageDetector' - A custom language detector
 * - async: true | false - lags below detect function to be async or not
 * - detect: (callback: any) => void - A phone language detector
 * @returns {void} None
 */
i18n
  .use<LanguageDetectorAsyncModule>(LANGUAGE_DETECTOR)
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v4',
    fallbackLng: 'en',
    resources: translations,
    react: {
      useSuspense: false
    }
  });

/**
 * Retrieves the localized string for the given key.
 *
 * @param {string | string[]} key - The key for the string to be translated.
 * @param {TOptions} [options] - Optional parameters to pass to the translation function.
 * @returns {string} The translated string.
 */
export const getTranslatedString = (key: string | string[], options?: TOptions): string => {
  return i18n.t(key, { ...options, ...AppConst.interpolation });
};
