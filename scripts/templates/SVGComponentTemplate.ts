import { type types } from '@babel/core';
import type { TemplateBuilder } from '@babel/template';
import type { Options } from '@svgr/babel-plugin-transform-svg-component';

/**
 * Variables available in the template
 */
interface TemplateVariables {
  componentName: string;
  interfaces: types.TSInterfaceDeclaration[];
  props: (types.ObjectPattern | types.Identifier)[];
  imports: types.ImportDeclaration[];
  exports: (types.VariableDeclaration | types.ExportDeclaration | types.Statement)[];
  jsx: types.JSXElement;
}

/**
 * Context for the template
 */
interface TemplateContext {
  options: Options;
  tpl: TemplateBuilder<types.Statement | types.Statement[]>['ast'];
}

/**
 * Extracts the viewBox attribute from a JSX string.
 *
 * @param {string} jsxString - The JSX string to parse.
 * @returns {string | null} The viewBox value, or null if it is not found.
 */
const getViewBoxFromJsx = (jsxString: string): string | null => {
  const jsxJson = JSON.parse(jsxString);
  const svgAttribute = jsxJson.openingElement.attributes;
  const viewBoxAttributes = svgAttribute.filter((attr: any) => attr?.name?.name === 'viewBox');

  if (viewBoxAttributes.length <= 0) {
    return null; // viewBox not found
  }
  return viewBoxAttributes[0]?.value?.value;
};

// General comments for the generated file
const generalComments = `
// Auto-generated file created by svgr-cli source svg template
// Run yarn icons-create to add or update
// Do not manual edit 
\n
`;

/**
 * Generate SVG component with given format
 *
 * @param variables - variables to inject in the template
 * @param variables.componentName - Name of the SVG component
 * @param variables.imports - Import statements for the component
 * @param variables.interfaces - Interface definitions for the component
 * @param variables.jsx - JSX representation of the SVG
 * @param variables.props - Props for the SVG component
 * @param variables.exports - Export statements for the component
 * @param root1 - Template helper
 * @param root1.tpl - Template function
 * @returns The generated SVG component as a string.
 */
export const SVGComponentTemplate = (
  variables: TemplateVariables,
  { tpl }: TemplateContext
): types.Statement | types.Statement[] => {
  return tpl`
    ${generalComments}
    ${'\n'}
    ${variables.imports};
    ${variables.interfaces};
    ${'\n'}
    ${`/**
      * The ${variables.componentName} SVG component
      * @param viewBox: ${getViewBoxFromJsx(JSON.stringify(variables.jsx, null, 2))}
      * @param props SvgProps which will change runtime
      * @returns react native component
      */\n`}
    const ${variables.componentName} = (${variables.props}): React.ReactElement => (
      ${variables.jsx}
    );
    ${'\n'}
    ${variables.exports};
  `;
};
