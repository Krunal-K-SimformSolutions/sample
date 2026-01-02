/**
 * Generates the component file content.
 *
 * @param variables - An object containing component details.
 * @param variables.componentName - The name of the component.
 * @param variables.propsImport - The import statement for the component's props.
 * @param variables.props - The props for the component.
 * @returns The generated component file content as a string.
 */
export const ComponentTemplate = (variables: {
  componentName: string;
  propsImport: string;
  props: string;
}): string => {
  return `
    import React from 'react';
    import { Text, View } from 'react-native';
    import { use${variables.componentName}Styles } from './${variables.componentName}Styles';
    import { use${variables.componentName} } from './use${variables.componentName}';
    import type { ${variables.propsImport} } from './${variables.componentName}Types';

    /**
     * ${variables.componentName} component.
     */
    const ${variables.componentName} = (${variables.props}): React.ReactNode => {
      const { styles } = use${variables.componentName}Styles();
      const {} = use${variables.componentName}();

      return (
        <View style={styles.container}>
          <Text style={styles.text}>{'The ${variables.componentName} component'}</Text>
        </View>
      );
    };

    export default ${variables.componentName};
  `;
};
