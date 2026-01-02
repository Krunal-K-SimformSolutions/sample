/**
 * A constant freezing object that contains the headers for different content types.
 *
 * @type {Object}
 * @property {Object} formData - Headers for multipart/form-data content type.
 * @property {Object} formUrlencoded - Headers for application/x-www-form-urlencoded content type.
 * @property {Object} json - Headers for application/json content type.
 */
export const APIHeaders = Object.freeze({
  formData: {
    'Content-Type': 'multipart/form-data'
  },
  formUrlencoded: {
    'Content-Type': 'application/x-www-form-urlencoded'
  },
  json: {
    'Content-Type': 'application/json'
  }
});

const APIServer = '/api';

const APIVersions = Object.freeze({
  v1: `${APIServer}/v1`
});

const APIModules = Object.freeze({
  auth: '/auth'
});

/**
 * A constant freezing object that contains the paths to the API endpoint url.
 *
 * @type {Object}
 */
export default Object.freeze({
  // Authentication and User Management
  login: `${APIVersions.v1}${APIModules.auth}/login`,
  logout: `${APIVersions.v1}${APIModules.auth}/logout`
});
