/**
 * Generates the content for a screen index file.
 *
 * @param variables - The variables for the template.
 * @param variables.screenName - The name of the screen.
 * @returns The generated screen index file content.
 */
export const ScreenIndexTemplate = (variables: { screenName: string }): string => {
  return `
    export { default as ${variables.screenName}Screen } from './${variables.screenName}Screen';
  `;
};
