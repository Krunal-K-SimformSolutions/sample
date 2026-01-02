/**
 * Generates the content for a screen file.
 *
 * @param variables - The variables for the template.
 * @param variables.screenName - The name of the screen.
 * @returns The generated screen file content.
 */
export const ScreenTemplate = (variables: { screenName: string }): string => {
  return `
    import React from 'react';
    import { Text, View } from 'react-native';
    import { use${variables.screenName}Styles } from './${variables.screenName}Styles';
    import { use${variables.screenName} } from './use${variables.screenName}';

    /**
     * ${variables.screenName} screen.
     */
    const ${variables.screenName}Screen = (): React.ReactNode => {
      const { styles } = use${variables.screenName}Styles();
      const {} = use${variables.screenName}();

      return (
        <View style={styles.container}>
          <Text style={styles.text}>{'The ${variables.screenName} screen'}</Text>
        </View>
      );
    };

    export default ${variables.screenName}Screen;
  `;
};
