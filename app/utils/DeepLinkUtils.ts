import _ from 'lodash';
import { sentryCaptureException } from '../configs';
import {
  deepLinkFeature,
  deepLinkParamKeyMappers,
  deepLinkParamKeys,
  deepLinkPrefixes,
  justOpenAppDeepLinks,
  deepLinkNavigationMappings,
  type commonDeepLinkKeys
} from '../constants';
import { logger } from './LoggerUtils';

/**
 * Converts an object into a URL path based on provided keys.
 * Example:
 * buildUrlPath({ tenantId: 'abc123', email: 'user@example.com' }, ['tenantId', 'email'])
 * → "/abc123/user%40example.com"
 *
 * @param {Array<string>} keys - The keys to extract and convert into the path.
 * @param {Record<string, any>} params - The object with dynamic keys.
 * @returns {string} Encoded URL path, or empty string if keys are missing.
 */
const buildUrlPath = (keys: Array<string>, params: Record<string, any>): string => {
  if (!params || !Array.isArray(keys)) return '';

  const segments = keys.map((key) => {
    const value = params[key];
    if (_.isEmpty(value) || _.isNil(value)) return undefined;
    return encodeURIComponent(value);
  });

  logger.d('buildUrlPath', { keys, params, segments });
  return segments.join('/');
};

/**
 * Converts an object into URL parameters based on provided keys.
 *
 * @param {Array<keyof typeof deepLinkParamKeys>} keys - The keys to extract and convert into URL parameters.
 * @param {BranchParams} [params] - The object with dynamic keys.
 * @returns {Record<string, any>} Encoded URL parameters, or empty object if keys are missing.
 */
const buildUrlParams = (
  keys: Array<keyof typeof deepLinkParamKeys>,
  params?: any
): Record<string, any> => {
  if (!params || !Array.isArray(keys)) return {};

  const segments = keys.map((key) => {
    const value: any = params[`${deepLinkParamKeyMappers[key] ?? ''}`];
    return {
      [key]: _.isEmpty(value) || _.isNil(value) ? undefined : encodeURIComponent(value ?? '')
    };
  });

  logger.d('buildUrlParams', { keys, params, segments });
  return { ...Object.assign({}, ...(segments ?? {})) };
};

/**
 * Return type for checkAndGetParams function.
 *
 * @interface CheckAndGetParamsReturn
 * @property {typeof deepLinkFeature[keyof typeof deepLinkFeature]} [feature] - The deep link feature type.
 * @property {string} [deepLink] - The constructed deep link URL.
 * @property {Record<string, any>} [param] - The parameters extracted from the deep link.
 */
export interface CheckAndGetParamsReturn {
  feature?: (typeof deepLinkFeature)[keyof typeof deepLinkFeature];
  deepLink?: string;
  param?: Record<string, any>;
}

/**
 * Parameters for checkAndGetParams function.
 *
 * @interface CheckAndGetParamsOptions
 * @property {keyof typeof commonDeepLinkKeys} key - The key of commonDeepLinkKeys.
 * @property {string} url - The original URL.
 * @property {string} suffix - The URL suffix.
 * @property {BranchParams} [params] - Branch parameters.
 * @property {boolean} [isRequiredUrl] - Whether the original URL is required in the parameters.
 * @property {Array<keyof typeof deepLinkParamKeys>} [extraKeys] - Extra keys to be included in the URL parameters.
 */
export interface CheckAndGetParamsOptions {
  key: keyof typeof commonDeepLinkKeys;
  url: string;
  suffix: string;
  params?: any;
  isRequiredUrl?: boolean;
  extraKeys?: Array<keyof typeof deepLinkParamKeys>;
}

/**
 * Get redirection url data
 *
 * @param root - root route
 * @param root.key - key of commonDeepLinkKeys
 * @param root.url - original url
 * @param root.params - branch params
 * @param root.suffix - url suffix
 * @param root.extraKeys - extra keys to be included in the url params
 * @param root.isRequiredUrl - whether the original url is required in the params
 * @returns {CheckAndGetParamsReturn} feature, deepLink and param
 */
const getRedirectionUrlData = ({
  key,
  url,
  params,
  suffix,
  extraKeys = [],
  isRequiredUrl = false
}: CheckAndGetParamsOptions): CheckAndGetParamsReturn => {
  const keys = [deepLinkParamKeys[key], ...extraKeys];
  const param = buildUrlParams(keys, {
    ...params,
    ...(isRequiredUrl ? { [deepLinkFeature[key]]: url } : {})
  });
  const deepLink = `${deepLinkPrefixes[0]}/${suffix}/${buildUrlPath(keys, param)}`;
  return { feature: deepLinkFeature[key], deepLink, param };
};

/**
 * Extracts URL query string parameters into an object.
 *
 * @param {string} url - The URL containing query parameters.
 * @returns {BranchParams} An object representing the URL parameters.
 */
const getParams = (url: string): any => {
  const queryString = url.split('?')[1];
  if (!queryString) return {};

  const params: Record<string, any> = {};
  for (const pair of queryString.split('&')) {
    const [key, value] = pair.split('=');
    if (key) {
      params[decodeURIComponent(key)] = value ? decodeURIComponent(value) : '';
    }
  }
  return params;
};

/**
 * Check if the URL is a deep link and return the corresponding route.
 *
 * @param {string} url - The deep link URL.
 * @param {BranchParams} [params] - Branch parameters.
 * @returns {CheckAndGetParamsReturn} feature, deepLink and param
 */
export const checkAndGetParams = (url: string, params?: any): CheckAndGetParamsReturn => {
  const branchUrl: string = decodeURIComponent(url);

  // if the url has no params, return just open the app
  if (_.some(justOpenAppDeepLinks, (domain: string) => branchUrl === domain)) return {};
  const urlParams: any = getParams(branchUrl);
  const tempParams: any = { ...params, ...urlParams };
  try {
    for (const map of deepLinkNavigationMappings) {
      if (map.urls.some((u) => _.startsWith(url, u))) {
        return getRedirectionUrlData({
          key: map.key,
          url,
          suffix: typeof map.suffix === 'function' ? map.suffix(tempParams) : map.suffix,
          params: tempParams,
          extraKeys: map.extraKeys,
          isRequiredUrl: map.isRequiredUrl
        });
      }
    }

    return {};
  } catch (error: any) {
    sentryCaptureException(error);
  }
  return {};
};
