/**
 * Template for generating a custom hook in TypeScript.
 *
 * @param variables - An object containing hook details.
 * @param variables.hookName - The name of the hook.
 * @param variables.type - The type of the hook.
 * @returns A string representing the TypeScript code for the custom hook.
 */
export const CustomHookTemplate = (variables: { hookName: string; type: string }): string => {
  return `
    /**
     * Types for ${variables.hookName} hook properties.
     */
    export type ${variables.hookName}Props = {
      // Define props here
    };

    /**
     * Types for ${variables.hookName} custom hook return.
     */
    export type Use${variables.hookName}HookReturn = {
      // Define type here
    }

    /**
     * Custom hook for ${variables.hookName} ${variables.type}.
     */
    const use${variables.hookName} = (): Use${variables.hookName}HookReturn => {
      // Implement hook logic here

      return {};
    };

    export default use${variables.hookName};
  `;
};
