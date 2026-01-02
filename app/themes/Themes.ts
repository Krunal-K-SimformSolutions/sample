import colors, { type ColorsType, type ThemeMode } from './Colors';
import spacing, { type SpacingType } from './Spacing';
import topographies, { type TopographiesType } from './Topographies';
import type { EdgeInsets } from 'react-native-safe-area-context';

/**
 * Represents the overall theme structure including colors, typography, and spacing.
 *
 * @param {ColorsType} colors - The color palette for the theme.
 * @param {TopographiesType} topographies - The typography settings including fonts, sizes, weights, and line heights.
 * @param {SpacingType} spacing - The spacing settings including border radius, border widths, opacity, and sizes.
 */
export type ThemesType = {
  colors: ColorsType;
} & TopographiesType &
  SpacingType;

/**
 * Represents the current theme including additional properties
 * such as whether it's dark mode, the theme mode, and safe area insets.
 *
 * @param {boolean} isDark - Indicates if the current theme is dark mode.
 * @param {ThemeMode} mode - The current theme mode (e.g., light, dark, system).
 * @param {EdgeInsets} insets - Safe area insets for proper layout on devices with notches or rounded corners.
 */
export type CurrentTheme = ThemesType & {
  isDark: boolean;
  mode: ThemeMode;
  insets: EdgeInsets;
};

/**
 * The default theme object combining colors, typography, and spacing.
 */
const themes: ThemesType = {
  colors: colors.light,
  ...topographies,
  ...spacing
};

export default themes;
