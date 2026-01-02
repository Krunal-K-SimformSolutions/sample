/**
 * Generate SVG component index file with given format
 *
 * @param entries - Array of entries containing import and map lines
 * @returns The generated SVG index file as a string.
 */
export const SVGIndexTemplate = (
  entries: Array<{ importLine: string; mapLine: string }>
): string => {
  return `
    ${entries.map(({ importLine }: { importLine: string }) => importLine).join('\n')}
    ${'\n'}
    export default Object.freeze({
      ${entries.map(({ mapLine }: { mapLine: string }) => mapLine).join(',\n')}
    });
  `;
};
