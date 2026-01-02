import type { DimensionValue } from 'react-native';
import { pad } from '../utils';
import { scale } from './Metrics';

const SIZE_VALUES = [
  0, 1, 2, 3, 4, 6, 8, 9, 10, 12, 13, 14, 15, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 35, 36, 38,
  39, 40, 41, 42, 43, 44, 45, 46, 48, 49, 50, 52, 54, 56, 60, 64, 66, 68, 72, 76, 80, 82, 83, 84,
  89, 93, 96, 100, 109, 120, 125, 128, 136, 140, 145, 160, 168, 170, 180, 192, 201, 224, 230, 256,
  267, 288, 320, 341, 384
] as const;

const PERCENTAGE_VALUES = [10, 20, 30, 40, 50, 55, 60, 70, 75, 80, 90, 100] as const;

/**
 * the represents the size values type
 */
type SizeType = {
  [K in (typeof SIZE_VALUES)[number] as `SS_${K}`]: number;
};

/**
 * the represents the percentage size values type
 */
type PercentageType = {
  [K in (typeof PERCENTAGE_VALUES)[number] as `SS_${K}P`]: DimensionValue;
};

/**
 * Helper to generate scaled size values
 *
 * @returns {Readonly<SizeType & PercentageType>} An object containing scaled sizes and percentage sizes
 */
const generateSizes = (): Readonly<SizeType & PercentageType> => {
  const sizeValues = Object.fromEntries(
    SIZE_VALUES.map((s) => [`SS_${pad(s)}`, s === 0 ? 0 : scale(s)])
  ) as SizeType;

  const percentageValues = Object.fromEntries(
    PERCENTAGE_VALUES.map((p) => [`SS_${p}P`, `${p}%` as DimensionValue])
  ) as PercentageType;

  return Object.freeze({
    ...sizeValues,
    ...percentageValues
  });
};

/**
 * Spacing constants for border radius, border widths, opacity, and sizes.
 */
const spacing = Object.freeze({
  borderRadius: Object.freeze({
    BR_00: 0,
    BR_02: scale(2),
    BR_04: scale(4),
    BR_08: scale(8),
    BR_10: scale(10),
    BR_12: scale(12),
    BR_16: scale(16),
    BR_24: scale(24),
    BR_32: scale(32),
    BR_40: scale(40),
    BR_48: scale(48),
    BR_56: scale(56),
    BR_84: scale(84),
    BR_999: 999
  }),
  borderWidths: Object.freeze({
    BW_00: 0,
    BW_05F: 0.5,
    BW_01: 1,
    BW_02: 2,
    BW_04: 4,
    BW_06: 6,
    BW_08: 8,
    BW_10: 10
  }),
  opacity: Object.freeze({
    OP_00: 0,
    OP_05: 0.05,
    OP_10: 0.1,
    OP_12: 0.12,
    OP_20: 0.2,
    OP_23: 0.23,
    OP_25: 0.25,
    OP_30: 0.3,
    OP_40: 0.4,
    OP_50: 0.5,
    OP_60: 0.6,
    OP_68: 0.68,
    OP_70: 0.7,
    OP_75: 0.75,
    OP_80: 0.8,
    OP_90: 0.9,
    OP_95: 0.95,
    OP_100: 1
  }),
  sizes: generateSizes()
});

/**
 * this type represents the structure of the spacing object
 */
export type SpacingType = typeof spacing;

/**
 * this type represents the border radius type
 */
export type BorderRadiusType = typeof spacing.borderRadius;

/**
 * this type represents the border widths type
 */
export type BorderWidthsType = typeof spacing.borderWidths;

/**
 * this type represents the opacity type
 */
export type OpacityType = typeof spacing.opacity;

/**
 * this type represents the sizes type
 */
export type SizesType = typeof spacing.sizes;

export default spacing;
