import { Platform } from 'react-native';
import { Fonts } from '../assets';
import { scale } from './Metrics';

const SIZE_VALUES = [10, 12, 14, 16, 18, 20, 24, 28, 30, 32, 36, 42, 50, 70] as const;

/**
 * the represents the font size values type
 */
type FontSizeType = {
  [K in (typeof SIZE_VALUES)[number] as `FS_${K}`]: number;
};

/**
 * the represents the line height values type
 */
type LineHeightType = {
  [K in (typeof SIZE_VALUES)[number] as `LH_${K}`]: number;
};

/**
 * Helper to generate font sizes
 *
 * @returns {Readonly<FontSizeType>} An object with scaled font sizes
 */
const generateFontSizes = (): Readonly<FontSizeType> => {
  const sizeValues = Object.fromEntries(
    SIZE_VALUES.map((s) => [`FS_${s}`, scale(s)])
  ) as FontSizeType;

  return Object.freeze({ ...sizeValues });
};

/**
 * Helper to generate line heights
 *
 * @returns {Readonly<LineHeightType>} An object with scaled line heights
 */
const generateLineHeights = (): Readonly<LineHeightType> => {
  const multiplier = 1.26; // Line height multiplier
  const sizeValues = Object.fromEntries(
    SIZE_VALUES.map((s) => [`LH_${s}`, scale(s * multiplier)])
  ) as LineHeightType;

  return Object.freeze({ ...sizeValues });
};

/**
 * Topographies constants for font families, sizes, weights, and line heights.
 */
const topographies = Object.freeze({
  fontFamily: Fonts,
  fontSizes: generateFontSizes(),
  fontWeights: Object.freeze({
    ...Platform.select({
      ios: {
        regular: '400' as const,
        medium: '500' as const,
        semibold: '600' as const,
        bold: '700' as const,
        extrabold: '800' as const,
        black: '900' as const
      },
      default: {
        regular: undefined,
        medium: undefined,
        semibold: undefined,
        bold: undefined,
        extrabold: undefined,
        black: undefined
      }
    })
  }),
  lineHeights: generateLineHeights()
});

/**
 * this type represents the structure of the topographies object
 */
export type TopographiesType = typeof topographies;

/**
 * this type represents the keys of the fontFamily object within topographies
 */
export type FontFamilyType = typeof topographies.fontFamily;

/**
 * this type represents the keys of the fontSizes object within topographies
 */
export type FontSizesType = typeof topographies.fontSizes;

/**
 * this type represents the keys of the fontWeights object within topographies
 */
export type FontWeightType = typeof topographies.fontWeights;

/**
 * this type represents the keys of the lineHeights object within topographies
 */
export type LineHeightsType = typeof topographies.lineHeights;

export default topographies;
