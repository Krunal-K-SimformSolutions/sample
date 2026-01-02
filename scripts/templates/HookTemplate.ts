/**
 * Generates a custom hook template.
 *
 * @param variables - The variables for the hook template.
 * @param variables.hookName - The name of the hook.
 * @param variables.type - The type of the hook.
 * @returns The custom hook template as a string.
 */
export const HookTemplate = (variables: { hookName: string; type: string }): string => {
  return `
    import type { Use${variables.hookName}HookReturn, Use${variables.hookName}HookProps } from './${variables.hookName}Types';

    /**
     * Custom hook for ${variables.hookName} ${variables.type}.
     */
    export const use${variables.hookName} = ({}: Use${variables.hookName}HookProps): Use${variables.hookName}HookReturn => {
      // Implement hook logic here

      return {};
    };
  `;
};
