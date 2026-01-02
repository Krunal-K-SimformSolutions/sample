// Define theme colors with corresponding color values
const baseColors = Object.freeze({
  white: '#FFFFFF',
  black: '#080B11',
  background: '#0C121D',
  backgroundWhite: '#FFFFFF'
});

const buttonDarkColors = Object.freeze({
  blue_01: '#E9EAEC',
  blue_02: '#CACDD0',
  blue_03: '#A1A5AC',
  blue_04: '#757B85',
  blue_05: '#4B5360',
  blue_06: '#242D3D',
  blue_07: '#1F2634',
  blue_08: '#1A202B',
  blue_09: '#151A23',
  blue_10: '#10141B'
});

const errorColors = Object.freeze({
  light: '#FDCECE',
  dark: '#FB3737'
});

const grayColors = Object.freeze({
  grayText: '#758098',
  icon: '#758098',
  cardBackground: '#1A212D',
  appBorder: '#1D2433',
  borderWhite: '#FFFFFF',
  whiteText: '#FFFFFF',
  inputBorder: '#242D3D'
});

const primaryRedColors = Object.freeze({
  red_01: '#FCEBEC',
  red_02: '#F7D0D2',
  red_03: '#F0ABAE',
  red_04: '#E98488',
  red_05: '#E25E64',
  red_06: '#DC3B42',
  red_07: '#BB3238',
  red_08: '#9C2A2F',
  red_09: '#7D2226',
  red_10: '#631B1E'
});

const secondaryBlueColors = Object.freeze({
  blue_01: '#E8F2FF',
  blue_02: '#C8DFFF',
  blue_03: '#9DC6FF',
  blue_04: '#6FABFF',
  blue_05: '#4392FF',
  blue_06: '#1A7AFF',
  blue_07: '#1668D9',
  blue_08: '#1257B5',
  blue_09: '#0F4691',
  blue_10: '#0C3773'
});

const successColors = Object.freeze({
  light: '#C1EBD4',
  dark: '#38BE75',
  lightPur: '#F2418A',
  gryStatus: '#4B5360',
  restDay: '#01C1D6'
});

const warningColors = Object.freeze({
  light: '#F9EAD2',
  dark: '#E29E23'
});

/**
 * A light theme object.
 */
const light = Object.freeze({
  actions: Object.freeze({
    darkError: errorColors.dark,
    lightError: errorColors.light,
    darkSuccess: successColors.dark,
    lightSuccess: successColors.light,
    darkWarning: warningColors.dark,
    lightWarning: warningColors.light,
    gayStatus: successColors.gryStatus,
    lightPurple: successColors.lightPur,
    restDay: successColors.restDay,
    darkGray: grayColors.grayText,
    lightGray: buttonDarkColors.blue_02
  }),
  base: Object.freeze({
    appBackground: baseColors.background,
    appBackgroundWhite: baseColors.backgroundWhite,
    black: baseColors.black,
    blackText: baseColors.black,
    border: grayColors.appBorder,
    border2: buttonDarkColors.blue_05,
    borderWhite: grayColors.borderWhite,
    cardBackground: grayColors.cardBackground,
    grayText: grayColors.grayText,
    icon: grayColors.icon,
    inputBackground: grayColors.cardBackground,
    inputBorder: grayColors.inputBorder,
    white: baseColors.white,
    whiteText: grayColors.whiteText
  }),
  button: Object.freeze({
    blue: secondaryBlueColors.blue_06,
    dark: buttonDarkColors.blue_06,
    grayText: grayColors.grayText,
    red: primaryRedColors.red_06,
    white: baseColors.white
  }),
  primary: Object.freeze({
    primary_50: primaryRedColors.red_01,
    primary_100: primaryRedColors.red_02,
    primary_200: primaryRedColors.red_03,
    primary_300: primaryRedColors.red_04,
    primary_400: primaryRedColors.red_05,
    primary_500: primaryRedColors.red_06,
    primary_600: primaryRedColors.red_07,
    primary_700: primaryRedColors.red_08,
    primary_800: primaryRedColors.red_09,
    primary_900: primaryRedColors.red_10
  }),
  secondary: Object.freeze({
    secondary_50: secondaryBlueColors.blue_01,
    secondary_100: secondaryBlueColors.blue_02,
    secondary_200: secondaryBlueColors.blue_03,
    secondary_300: secondaryBlueColors.blue_04,
    secondary_400: secondaryBlueColors.blue_05,
    secondary_500: secondaryBlueColors.blue_06,
    secondary_600: secondaryBlueColors.blue_07,
    secondary_700: secondaryBlueColors.blue_08,
    secondary_800: secondaryBlueColors.blue_09,
    secondary_900: secondaryBlueColors.blue_10
  }),
  variable: Object.freeze({
    streets: '#444444',
    transparent: 'transparent',
    datePicker: '#808080',
    avatar: buttonDarkColors.blue_08,
    virtualTravel: '#00546E',
    weightlifting: '#DB3736',
    blur: '#D7D7D71A',
    running: buttonDarkColors.blue_01
  })
});

/**
 * A dark theme object.
 */
const dark = light;

/**
 * Enum for ThemeMode
 *
 * 'light' - Light theme mode
 * 'dark' - Dark theme mode
 * 'system' - System theme mode
 */
export enum ThemeModeEnum {
  'light' = 'light',
  'dark' = 'dark',
  'system' = 'system'
}

/**
 * Type for ThemeMode
 *
 * 'light' | 'dark' - Theme modes
 */
export type ThemeMode = ThemeModeEnum.light | ThemeModeEnum.dark;

/**
 * Type for Colors
 */
export type ColorsType = typeof light | typeof dark;

export default { light, dark };
