/**
 * Generates a Redux slice reducer template.
 *
 * @param variables - An object containing the slice and reducer names.
 * @param variables.sliceName - The name of the slice.
 * @param variables.reducerName - The name of the reducer.
 * @returns A string representing the Redux slice reducer code.
 */
export const SliceReducerTemplate = (variables: {
  sliceName: string;
  reducerName: string;
}): string => {
  return `
    import { createSlice, Draft, type ActionReducerMapBuilder } from '@reduxjs/toolkit';
    import { resetLoadingState, resetSession } from '../CommonAction';
    import { INITIAL_STATE, ${variables.sliceName}SliceName, type ${variables.sliceName}StateType } from './${variables.sliceName}Initial';

    /**
     * Creating a ${variables.sliceName} slice of the redux store
     * @param {${variables.sliceName}StateType} state - The current state of the ${variables.sliceName} reducer.
     * @param {Action} action - The action to handle.
     * @returns {${variables.sliceName}StateType} The new state of the ${variables.sliceName} reducer.
     */
    const ${variables.reducerName}Slice = createSlice({
      name: ${variables.sliceName}SliceName,
      initialState: INITIAL_STATE,
      reducers: {},
      extraReducers: (builder: ActionReducerMapBuilder<${variables.sliceName}StateType>) => {
        builder.addCase(resetLoadingState.type, (state: Draft<${variables.sliceName}StateType>) => {
          state.loading = false;
        });

        builder.addCase(resetSession.type, (state: Draft<${variables.sliceName}StateType>) => {
          Object.assign(state, INITIAL_STATE);
        });
      }
    });

    /* Exporting the reducer function that will be used in the root reducer. */
    export const ${variables.sliceName}Reducer = ${variables.reducerName}Slice.reducer;

    /**
     * Creates an object with all of the actions for the ${variables.sliceName} slice.
     * @returns {Object} - An object with all of the actions for the ${variables.sliceName} slice.
     */
    export const ${variables.sliceName}Actions = {
      ...${variables.reducerName}Slice.actions
    };
  `;
};
