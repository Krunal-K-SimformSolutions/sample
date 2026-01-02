/**
 * Generate StyleTemplate content
 *
 * @param variables - The variables for the template
 * @param variables.relativeHookPath - The relative path to the hook
 * @param variables.relativeThemePath - The relative path to the theme
 * @param variables.styleName - The name of the style
 * @param variables.fileType - The type of the file
 * @param variables.componentName - The name of the component
 * @returns The generated StyleTemplate content
 */
export const StyleTemplate = (variables: {
  relativeHookPath: string;
  relativeThemePath: string;
  styleName: string;
  fileType: string;
  componentName: string;
}): string => {
  return `
    import { StyleSheet } from 'react-native';
    import { useTheme } from '${variables.relativeHookPath}';
    import { CurrentTheme } from '${variables.relativeThemePath}';

    /**
     * Create ${variables.styleName} ${variables.fileType} style with different variant
     */
    export const ${variables.styleName}Styles = ({ sizes, borderRadius }: CurrentTheme) =>
      StyleSheet.create({
        container: {
          minHeight: sizes.SS_44,
          paddingHorizontal: sizes.SS_16,
          borderRadius: borderRadius.BR_04
        }
    });

    /**
     * Create ${variables.styleName} ${variables.fileType} styles
     */
    const common${variables.componentName}Styles = ({ colors }: CurrentTheme) =>
      StyleSheet.create({
        container: {
          backgroundColor: colors.base.white,
          flex: 1
        },
        text: {
          color: colors.base.black
        }
    });

    /**
     * Create ${variables.styleName} ${variables.fileType} style with different variant
     * @returns ${variables.styleName} ${variables.fileType} style
     */
    export const use${variables.componentName}Styles = () => {
      const styles = useTheme((props) => ({
        ...${variables.styleName}Styles(props),
        ...common${variables.componentName}Styles(props)
      }));

      return styles;
    };
  `;
};
