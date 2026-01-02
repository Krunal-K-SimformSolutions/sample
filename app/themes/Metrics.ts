import { Dimensions, Platform, type ScaledSize } from 'react-native';

// Constants
const GUIDELINE_BASE_WIDTH = 375;
const GUIDELINE_BASE_HEIGHT = 812;
const TABLET_THRESHOLD = 1.2;
const TABLET_MULTIPLIER = 0.4;
const PHONE_MULTIPLIER = 0.5;

/**
 * Get the width and height of the device screen in portrait orientation.
 *
 * @param {'window' | 'screen'} dim - 'window' or 'screen' to specify which dimensions to retrieve
 * @returns {Pick<ScaledSize, 'height' | 'width'>} The width and height of the device screen
 */
const getDimensions = (dim: 'window' | 'screen'): Pick<ScaledSize, 'height' | 'width'> => {
  const { width, height } = Dimensions.get(dim);

  // Ensure portrait orientation
  if (width > height) {
    return { width: height, height: width };
  }
  return { width, height };
};

// Get dimensions once
const { width, height } = getDimensions('window');
const { width: screenWidth, height: screenHeight } = getDimensions('screen');

// Calculate scaling factors
const baseWidth = width / GUIDELINE_BASE_WIDTH;
const baseHeight = height / GUIDELINE_BASE_HEIGHT;
const averageBase = (baseWidth + baseHeight) / 2;

// Determine device type
const isTablet = (Platform.OS === 'ios' && Platform.isPad) || averageBase > TABLET_THRESHOLD;

// Calculate final base size
const baseSize = (baseWidth + baseHeight) * (isTablet ? TABLET_MULTIPLIER : PHONE_MULTIPLIER);

/**
 * Scales a size based on the device's screen dimensions.
 *
 * @param {number} size - The base size to scale
 * @param {boolean} [isRounded=false] - Whether to round up the result (default: false)
 * @returns {number} The scaled size
 */
export const scale = (size: number, isRounded = false): number => {
  if (isRounded) {
    return Math.ceil(size * baseSize);
  }
  return size * baseSize;
};

/**
 * Global metrics for the current device.
 *
 * @property width - The width of the device screen
 * @property height - The height of the device screen
 * @property screenWidth - The full screen width of the device
 * @property screenHeight - The full screen height of the device
 * @property isAndroid - Whether the device is running Android
 * @property isIos - Whether the device is running iOS
 * @property isPad - Whether the device is an iPad
 * @property isTV - Whether the device is a TV
 * @property isWeb - Whether the device is running on web
 * @property isGreaterThenAndroid12 - Whether the Android version is greater than 12
 */
export const globalMetrics = Object.freeze({
  width,
  height,
  screenWidth,
  screenHeight,
  isAndroid: Platform.OS === 'android',
  isIos: Platform.OS === 'ios',
  isPad: Platform.OS === 'ios' && Platform.isPad,
  isTV: Platform.isTV,
  isWeb: Platform.OS === 'web',
  isGreaterThenAndroid12: Platform.OS === 'android' && Platform.Version > 32
});
