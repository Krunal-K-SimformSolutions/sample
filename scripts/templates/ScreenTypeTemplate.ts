/**
 * Generates the content for a screen type definition file.
 *
 * @param variables - The variables for the template.
 * @param variables.screenName - The name of the screen.
 * @returns The generated screen type definition file content.
 */
export const ScreenTypeTemplate = (variables: { screenName: string }): string => {
  return `
    export interface Use${variables.screenName}HookProps {
      // Define type here
    }

    export type Use${variables.screenName}HookReturn = {
      // Define type here
    }
  `;
};
