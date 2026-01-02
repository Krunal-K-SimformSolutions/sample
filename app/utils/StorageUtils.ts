import _ from 'lodash';
import { createMMKV } from 'react-native-mmkv';
import { AppConst, StorageKeyConst } from '../constants';
import { logger } from './LoggerUtils';

/**
 * A wrapper around the MMKV class that provides a simple interface for storing and retrieving
 * data.
 */
export const storage = createMMKV({
  id: AppConst.mmkvStorageId,
  encryptionKey: AppConst.mmkvEncryptionKey,
  mode: 'multi-process',
  readOnly: false
});

/**
 * A type that can be stored in localStorage.
 *
 * @typedef {boolean | string | number | ArrayBuffer | object} StorageStringType
 */
export type StorageStringType = boolean | string | number | ArrayBuffer | object;

/**
 * "Get a value from storage, and if it doesn't exist, return the default value."
 * The function is generic, so you can pass in a string, number, boolean, or object as the default
 * value
 *
 * @param {string} key - The key to store the value under.
 * @param {T} defaultValue - The default value to return if the key doesn't exist.
 * @returns {T} The return type is T, which is a generic type.
 */
export const getStorageItem = <T extends StorageStringType>(key: string, defaultValue: T): T => {
  const keyName = `${StorageKeyConst.storageKeyPrefix}-${key}`;

  if (typeof defaultValue === 'boolean') {
    const value = storage.getBoolean(keyName);
    logger.d('getStorageItem', { keyName, value });
    return (value ?? defaultValue) as T;
  }

  if (typeof defaultValue === 'number') {
    const value = storage.getNumber(keyName);
    logger.d('getStorageItem', { keyName, value });
    return (value ?? defaultValue) as T;
  }

  if (typeof defaultValue === 'string') {
    const value = storage.getString(keyName);
    logger.d('getStorageItem', { keyName, value });
    return (value ?? defaultValue) as T;
  }

  if (defaultValue instanceof ArrayBuffer) {
    const value = storage.getBuffer(keyName);
    logger.d('getStorageItem', { keyName, value });
    return (value ?? defaultValue) as T;
  }

  if (typeof defaultValue === 'object') {
    const value = storage.getString(keyName);
    if (_.isNil(value) || _.isEmpty(value)) {
      return defaultValue as T;
    }
    logger.d('getStorageItem', { keyName, value: JSON.parse(value) });
    return JSON.parse(value) as T;
  }

  return defaultValue;
};

/**
 * "This function sets a value in the local storage, and it accepts a string, boolean,
 * number, or object as the value."
 *
 * The first line of the function is a type guard. It checks to see if the value is a boolean, string,
 * or number. If it is, then the value is assigned to the value variable. If it isn't, then the value
 * is converted to a string and assigned to the value variable
 *
 * @param {string} key - The key to store the value under.
 * @param {T} newValue - The new value to set.
 * @returns {void} None
 */
export const setStorageItem = <T extends StorageStringType>(key: string, newValue: T): void => {
  const keyName = `${StorageKeyConst.storageKeyPrefix}-${key}`;
  logger.d('setStorageItem', { keyName, newValue });

  if (_.isNil(newValue)) {
    logger.w('setStorageItem: Trying to set undefined or null value', { keyName, newValue });
    return;
  }

  if (typeof newValue === 'boolean') {
    storage.set(keyName, newValue);
    return;
  }

  if (typeof newValue === 'number') {
    storage.set(keyName, newValue);
    return;
  }

  if (typeof newValue === 'string') {
    storage.set(keyName, newValue);
    return;
  }

  if (newValue instanceof ArrayBuffer) {
    storage.set(keyName, newValue);
    return;
  }

  if (typeof newValue === 'object') {
    const value = JSON.stringify(newValue);
    storage.set(keyName, value);
  }
};

/**
 * Remove a value from storage.
 *
 * @param {string} key - The key to remove from storage.
 * @returns None
 */
export const removeStorageItem = (key: string): void => {
  const keyName = `${StorageKeyConst.storageKeyPrefix}-${key}`;
  storage.remove(keyName);
};

/**
 * Clear all items from storage.
 *
 * @returns {void} None
 */
export const clearStorageItems = (): void => {
  storage.clearAll();
};
