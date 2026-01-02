/**
 * Generates the initial template for a Redux slice.
 *
 * @param variables - An object containing the slice and reducer names.
 * @param variables.sliceName - The name of the slice.
 * @param variables.reducerName - The name of the reducer.
 * @returns {string} The generated template as a string.
 */
export const SliceInitialTemplate = (variables: {
  sliceName: string;
  reducerName: string;
}): string => {
  return `
    /**
     * Defines the shape of the ${variables.sliceName} state in the application's Redux store.
     */
    export interface ${variables.sliceName}StateType {
      loading: boolean;
    };

    /**
     * Defining the initial state of the ${variables.sliceName} reducer.
     * @returns {${variables.sliceName}StateType} The initial state of the ${variables.sliceName} reducer.
     */
    export const INITIAL_STATE: ${variables.sliceName}StateType = {
      loading: false
    };

    export const ${variables.sliceName}SliceName = '${variables.reducerName}';
  `;
};
