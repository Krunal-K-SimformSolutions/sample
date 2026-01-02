import { PixelRatio } from 'react-native';
import {
  useSafeAreaFrame,
  useSafeAreaInsets,
  type EdgeInsets,
  type Rect
} from 'react-native-safe-area-context';
import { globalMetrics } from '../themes';

/**
 * A status bar hook returns the height of the status bar.
 *
 * @returns {number} The height of the status bar.
 */
export const useStatusBarHeight = (): number => {
  const insets: EdgeInsets = useSafeAreaInsets();
  const topInset: number = insets.top;

  // On models with Dynamic Island the status bar height is smaller than the safe area top inset.
  const hasDynamicIsland = globalMetrics.isIos && topInset > 50;
  const statusBarHeight = hasDynamicIsland ? topInset - (5 + 1 / PixelRatio.get()) : topInset;

  return statusBarHeight;
};

/**
 * A header returns the height of the header.
 *
 * @param {boolean} [modalPresentation=false] - Whether the header is being used in a modal presentation.
 * @returns {number} The height of the header.
 */
export const useHeaderHeight = (modalPresentation: boolean = false): number => {
  let headerHeight = 0;
  const layout: Rect = useSafeAreaFrame();
  const statusBarHeight: number = useStatusBarHeight();

  const isLandscape = layout.width > layout.height;

  if (globalMetrics.isIos) {
    if (globalMetrics.isPad || globalMetrics.isTV) {
      if (modalPresentation) {
        headerHeight = 56;
      } else {
        headerHeight = 50;
      }
    } else if (isLandscape) {
      headerHeight = 32;
    } else if (modalPresentation) {
      headerHeight = 56;
    } else {
      headerHeight = 44;
    }
  } else {
    headerHeight = 64;
  }

  return headerHeight + statusBarHeight;
};
