import Config from 'react-native-config';
import { scheme } from '../../app.json';

/**
 * Type definition for Environment variable.
 */
type Environment = 'production' | 'staging' | 'development';

const environment = (Config.ENVIRONMENT ?? 'production').toLowerCase() as Environment;
const envUrls: { [key in Environment]: string } = {
  production: 'https://api.risingapp.co.uk/',
  staging: 'https://dev-api.risingapp.co.uk/',
  development: 'https://dev-api.risingapp.co.uk/'
};

/**
 * A constant freezing object that contains the app value.
 *
 * @type {Object}
 */
export default Object.freeze({
  environment,
  isDevelopment: __DEV__ || environment === 'development',
  sentryUrl: 'https://c20897cb142f556ab91cedfb9dd6e87c@sentry-insights.simformsolutions.com/5',
  apiUrl: envUrls[environment],
  mmkvEncryptionKey: Config.MMKV_ENCRYPTION_KEY ?? '',
  mmkvStorageId: Config.MMKV_STORAGE_ID ?? '',
  apiTimeout: 60000, // 1 minutes
  asyncTimeout: 90000, // 1.5 minutes
  defaultPageSize: 10,
  tncUrl: 'https://risingapp.co.uk/terms-and-condition/?hide_header=true',
  privacyUrl: 'https://risingapp.co.uk/privacy-policy/?hide_header=true',
  appBundle: 'com.newproject',
  appScheme: scheme,
  deepLinkHost1: '',
  deepLinkHost2: '',
  deepLinkHost3: '',
  deepLinkHost4: '',
  interpolation: { interpolation: { escapeValue: false } },
  maxLengthForSingleLineInput: 500,
  maxLengthForMultiLineInput: 50000
});
