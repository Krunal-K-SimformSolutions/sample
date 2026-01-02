/**
 * Generates the index file content for a component.
 *
 * @param variables - An object containing the component name.
 * @param variables.componentName - The name of the component.
 * @returns The generated index file content as a string.
 */
export const ComponentIndexTemplate = (variables: { componentName: string }): string => {
  return `
    export { default as ${variables.componentName} } from './${variables.componentName}';
    export * from './${variables.componentName}Types';
  `;
};
