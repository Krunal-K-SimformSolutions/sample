/**
 * Generates the type definitions for a component.
 *
 * @param variables - An object containing component details.
 * @param variables.styleName - The name of the style hook.
 * @param variables.componentName - The name of the component.
 * @returns The generated type definitions as a string.
 */
export const ComponentTypeTemplate = (variables: {
  styleName: string;
  componentName: string;
}): string => {
  return `
    import { ${variables.styleName}Styles } from './${variables.componentName}Styles';

    export interface ${variables.componentName}VariantProps {
      variant?: keyof ReturnType<typeof ${variables.styleName}Styles>;
    }

    export interface ${variables.componentName}Props extends ${variables.componentName}VariantProps {
      // Define props here
    };

    export interface Use${variables.componentName}HookProps {
      // Define type here
    }

    export interface Use${variables.componentName}HookReturn {
      // Define type here
    }
  `;
};
