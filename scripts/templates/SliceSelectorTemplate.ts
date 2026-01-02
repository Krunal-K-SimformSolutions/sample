/**
 * Generates a template for Redux slice selectors.
 *
 * @param variables - The variables to customize the template.
 * @param variables.sliceName - The name of the Redux slice.
 * @param variables.reducerName - The name of the reducer within the slice.
 * @param variables.relativeReduxPath - The relative path to the Redux store.
 * @returns The generated TypeScript code as a string.
 */
export const SliceSelectorTemplate = (variables: {
  sliceName: string;
  reducerName: string;
  relativeReduxPath: string;
}): string => {
  return `
    import { createSelector } from '@reduxjs/toolkit';
    import { type ${variables.sliceName}StateType, ${variables.sliceName}SliceName } from './${variables.sliceName}Initial';
    import type { RootStateType } from '${variables.relativeReduxPath}';

    /**
     * The selector for the ${variables.sliceName} state.
     */
    const get${variables.sliceName} = (state: RootStateType): ${variables.sliceName}StateType => state[${variables.sliceName}SliceName];

    /**
     * A type that contains all the selectors for the ${variables.sliceName} state.
     * @property {(state: RootStateType) => boolean} getLoading - The selector for the loading state.
     */
    type ${variables.sliceName}SelectorsType = {
      getLoading: (state: RootStateType) => boolean;
    };

    /**
     * A type containing the selectors for the ${variables.sliceName} state.
     * @type {${variables.sliceName}SelectorsType}
     */
    const ${variables.sliceName}Selectors: ${variables.sliceName}SelectorsType = {
      getLoading: createSelector([get${variables.sliceName}], (${variables.reducerName}) => ${variables.reducerName}.loading)
    };

    export default ${variables.sliceName}Selectors;
  `;
};
