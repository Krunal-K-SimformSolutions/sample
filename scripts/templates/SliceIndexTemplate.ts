/**
 * Generates the content for a Slice index file.
 *
 * @param variables - The variables for the template.
 * @param variables.sliceName - The name of the slice.
 * @returns The generated Slice index file content.
 */
export const SliceIndexTemplate = (variables: { sliceName: string }): string => {
  return `
    export { default as ${variables.sliceName}Selectors } from './${variables.sliceName}Selector';
    export { ${variables.sliceName}Actions, ${variables.sliceName}Reducer } from './${variables.sliceName}Slice';
    export { ${variables.sliceName}SliceName } from './${variables.sliceName}Initial';
  `;
};
