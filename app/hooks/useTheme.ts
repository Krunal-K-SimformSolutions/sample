import { useCallback, useMemo } from 'react';
import { useColorScheme, type ColorSchemeName } from 'react-native';
import _ from 'lodash';
import { useMMKVString } from 'react-native-mmkv';
import { useSafeAreaInsets, type EdgeInsets } from 'react-native-safe-area-context';
import { StorageKeyConst } from '../constants';
import { Colors, ThemeModeEnum, Themes, type ThemeMode, type CurrentTheme } from '../themes';

/**
 * The return type of the useTheme hook.
 *
 * @template T - The type of the styles object.
 * @typedef {Object} UseThemeReturnType
 * @property {CurrentTheme} - The current theme and colors.
 * @property {T} styles - The styles object.
 * @property {(value: ThemeMode) => void} changeTheme - Function to change the theme.
 */
export type UseThemeReturnType<T> = CurrentTheme & {
  styles: T;
  changeTheme: (value: ThemeMode) => void;
};

/**
 * Hook to get the current theme and colors.
 * If the theme is set to `system`, it will use the device's theme.
 * If the theme is set to `light` or `dark`, it will use the corresponding theme.
 * If the theme is not set, it will default to `light`.
 * The hook will also return a `changeTheme` function to change the theme.
 * The `changeTheme` function will persist the theme to AsyncStorage.
 *
 * @param {((props: CurrentTheme) => T) | undefined} [styleSheetFn] - A function to generate the styles.
 * @returns {UseThemeReturnType<T>} The current theme and colors, and a function to change the theme.
 */
const useTheme = <T>(styleSheetFn?: (props: CurrentTheme) => T): UseThemeReturnType<T> => {
  const theme: ColorSchemeName = useColorScheme();
  const insets: EdgeInsets = useSafeAreaInsets();
  const [themeMode, setThemeMode] = useMMKVString(StorageKeyConst.appTheme);

  const currentThemeMode = useMemo<ThemeMode>(
    () =>
      (_.isEqual(themeMode ?? ThemeModeEnum.system, ThemeModeEnum.system)
        ? (theme ?? ThemeModeEnum.light)
        : themeMode) as ThemeMode,
    [theme, themeMode]
  );

  const currentTheme = useMemo<CurrentTheme>(
    () => ({
      ...Themes,
      insets,
      mode: currentThemeMode,
      colors: Colors[currentThemeMode],
      isDark: currentThemeMode === ThemeModeEnum.dark
    }),
    [currentThemeMode, insets]
  );

  const styles = useMemo<T>(
    () => (styleSheetFn?.(currentTheme) ?? {}) as T,
    [styleSheetFn, currentTheme]
  );

  const changeTheme = useCallback<(value: ThemeMode) => void>(
    (value: ThemeMode) => {
      setThemeMode(String(value));
    },
    [setThemeMode]
  );

  return { ...currentTheme, styles, changeTheme };
};

export default useTheme;
