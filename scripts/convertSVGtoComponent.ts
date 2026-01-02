/* eslint-disable import/no-extraneous-dependencies */
import path from 'node:path';
import { transformFromAstSync, createConfigItem, type PluginOptions } from '@babel/core';
import traverse from '@babel/traverse';
import t from '@babel/types';
import svgrBabelPreset from '@svgr/babel-preset';
import { transform, type Config, type State } from '@svgr/core';
import hastToBabelAst from '@svgr/hast-util-to-babel-ast';
import { program } from 'commander';
import fs from 'fs-extra';
import { parse } from 'svg-parser';
import { toPascalCase, writeJsxToTsFile } from './commonMethod';
import { SVGComponentTemplate, SVGIndexTemplate } from './templates';

const SOURCE_PATH = 'scripts/svg-source';
const TARGET_PATH = 'app/assets/svgs';

// List of attributes to modify
const modifyAttributeList = new Set(['width', 'height', 'color', 'fill', 'stroke', 'strokeWidth']);
const svgAttributeList = new Set(['width', 'height']);
const stringAttributeList = new Set(['color', 'fill', 'stroke']);

/**
 * Helper function to get JSX Runtime options
 *
 * @param config - SVGR configuration object.
 * @returns JSX Runtime options for SVGR preset.
 */
const getJsxRuntimeOptions = (config: Config): PluginOptions => {
  if (config.jsxRuntimeImport) {
    return {
      importSource: config.jsxRuntimeImport.source,
      jsxRuntimeImport: config.jsxRuntimeImport
    };
  }
  switch (config.jsxRuntime ?? 'classic') {
    case 'classic':
      return { jsxRuntime: 'classic', importSource: 'react' };
    case 'automatic':
      return { jsxRuntime: 'automatic' };
    default:
      throw new Error(`Unsupported "jsxRuntime" "${config.jsxRuntime}"`);
  }
};

/**
 * Custom plugin to modify JSX attributes in the Babel AST.
 * This will ensure that attributes like `width`, `height`, and `fill` are set or updated.
 *
 * @param babelTree - The Babel AST of the SVG component.
 */
const modifyJsxAttributes = (babelTree: t.Node) => {
  // Traverse the Babel AST and modify attributes
  traverse(babelTree, {
    /**
     * This function is a Babel traverse callback for JSXAttribute nodes.
     * It checks if the attribute name is 'fill', 'width', or 'height'.
     * If it's 'fill', it sets the value to 'currentColor'. If it's 'width' or 'height',
     * it sets the value to a JSX expression container with the identifier
     * `props.${attributeName} ?? 24`. This allows the attribute to be set
     * dynamically with a fallback value of 24.
     *
     * @param {babel.types.JSXAttribute} jsxPath - The Babel path of the JSXAttribute node.
     */
    JSXAttribute(jsxPath) {
      const attributeName = String(jsxPath.node.name.name as any); // Get the name of the attribute

      // Remove 'xmlns' attributes
      if (attributeName.startsWith('xmlns')) {
        jsxPath.remove();
        return;
      }

      let attributeValue;
      // Check if the attribute name is not 'fill', 'width', or 'height'
      if (!modifyAttributeList.has(attributeName)) {
        return;
      }

      // Get the component name by accessing the opening element
      const componentName = jsxPath.findParent(
        (parentPath) => t.isJSXOpeningElement(parentPath.node) && t.isJSXElement(parentPath.parent)
        // @ts-expect-error - TS doesn't know about our custom name property
      )?.node.name.name;

      // Check if the attribute name is not 'fill', 'width', or 'height'
      if (svgAttributeList.has(attributeName) && componentName !== 'svg') {
        // If the component name is not 'svg', return
        return;
      }

      const isStringValue = stringAttributeList.has(attributeName);
      // Check the type of the attribute value
      if (t.isStringLiteral(jsxPath.node.value)) {
        // If the value is a string, get the value directly
        attributeValue = jsxPath.node.value.value;
      } else if (t.isJSXExpressionContainer(jsxPath.node.value)) {
        // If the value is an expression, get the expression's value (e.g., {someVar})
        if (t.isIdentifier(jsxPath.node.value.expression)) {
          attributeValue = jsxPath.node.value.expression.name; // Variable name
        } else if (t.isLiteral(jsxPath.node.value.expression)) {
          // @ts-expect-error - TS doesn't know about our custom value property
          attributeValue = jsxPath.node.value.expression.value; // Literal value
        } else {
          attributeValue = 'expression'; // Fallback for complex expressions
        }
      }

      if (attributeValue !== 'attributeValue' && attributeValue !== 'none') {
        jsxPath.node.value = t.jsxExpressionContainer(
          t.logicalExpression(
            '??',
            t.memberExpression(t.identifier('props'), t.identifier(attributeName)),
            isStringValue ? t.stringLiteral(attributeValue) : t.numericLiteral(attributeValue) // Fallback value
          )
        );
      }
    }
  });
};

/**
 * Creates the options object to be passed to the SVGR preset.
 *
 * It takes the user-provided options and adds the state and JSX runtime options.
 *
 * @param {object} config - The user-provided options.
 * @param {object} state - The state object.
 * @returns {object} An object containing the options for the SVGR preset.
 */
const getSvgPresetOptions = (config: Config, state: State): PluginOptions => ({
  ref: config.ref,
  dimensions: config.dimensions,
  icon: config.icon,
  native: config.native,
  svgProps: config.svgProps,
  replaceAttrValues: config.replaceAttrValues,
  typescript: config.typescript,
  expandProps: config.expandProps,
  template: config.template,
  memo: config.memo,
  exportType: config.exportType,
  namedExport: config.namedExport,
  ...getJsxRuntimeOptions(config),
  state
});

/**
 * Custom plugin to add scaling properties and modify attributes
 *
 * @param code - The SVG code as a string.
 * @param config - SVGR configuration object.
 * @param state - SVGR state object.
 * @returns The transformed SVG code with scaling properties.
 * @throws An error if the SVG file cannot be generated.
 */
const scalePlugin = (code: string, config: Config, state: State): string => {
  const filePath = state.filePath ?? 'unknown';
  const hastTree = parse(code);
  const babelTree = hastToBabelAst(hastTree);

  modifyJsxAttributes(babelTree);
  const svgPresetOptions = getSvgPresetOptions(config, state);

  const result = transformFromAstSync(babelTree, code, {
    caller: { name: 'svgr' },
    presets: [createConfigItem([svgrBabelPreset, svgPresetOptions], { type: 'preset' })],
    filename: filePath,
    babelrc: false,
    configFile: false,
    code: true
  });

  if (!result?.code) {
    throw new Error('Unable to generate SVG file');
  }
  return result.code;
};

// Babel preset options
const options: Config = {
  icon: false,
  native: true,
  typescript: true,
  // @ts-expect-error - TS doesn't know about our custom componentName property
  componentName: 'SVGIcon',
  plugins: [scalePlugin],
  template: SVGComponentTemplate,
  dimensions: true,
  expandProps: 'end',
  prettier: true,
  prettierConfig: {
    useTabs: false,
    printWidth: 100,
    tabWidth: 2,
    singleQuote: true,
    trailingComma: 'none',
    semi: true,
    quoteProps: 'as-needed',
    bracketSpacing: true,
    arrowParens: 'always',
    bracketSameLine: false,
    endOfLine: 'lf'
  },
  filenameCase: 'pascal',
  ignoreExisting: true
};

/**
 * Generates an index.ts file with exports for all of the SVG files.
 *
 * @param outputDir - The directory where the React Native components are saved.
 * This is used to allow importing of all SVG files at once.
 * @returns A Promise that resolves when the index file has been generated.
 * @throws An error if the index file fails to generate.
 */
const generateIndexFile = async (outputDir: string): Promise<void> => {
  const indexFile = path.join(outputDir, 'index.ts');
  // Read all files from the components directory
  const files = fs.readdirSync(outputDir);

  // Filter for .tsx files (assuming your SVG components are .tsx)
  const filePaths = files
    .filter((file) => path.extname(file) === '.tsx')
    .map((filePath) => {
      const basename = path.basename(filePath, path.extname(filePath));
      const importLine = `import ${basename} from './${basename}';`;
      const mapLine = `${basename}`;
      return { importLine, mapLine };
    });
  const jsx = SVGIndexTemplate(filePaths);

  // Generate export statements for each component
  await writeJsxToTsFile(indexFile, jsx);
  console.info('Generated index.ts');
};

/**
 * Generate a React Native component from an SVG file.
 *
 * This function will only generate the component if the output file does not already exist.
 *
 * @param svgsDir - The directory where the SVG files are located.
 * @param outputDir - The directory where the React Native components will be saved.
 * @param file - The name of the SVG file in the svgs directory.
 * @returns A Promise that resolves when the component has been generated.
 * @throws An error if the component fails to generate.
 */
const generateComponent = async (
  svgsDir: string,
  outputDir: string,
  file: string
): Promise<{ error?: Error }> => {
  let componentName = '';
  try {
    const inputFilePath = path.join(svgsDir, file);
    const outputFilePath = path.join(outputDir, `${toPascalCase(path.basename(file, '.svg'))}.tsx`);

    if (!fs.existsSync(outputFilePath)) {
      // Load SVG file
      const svg = fs.readFileSync(inputFilePath, 'utf8');
      // Generate component name
      componentName = toPascalCase(path.basename(file, '.svg'));

      // Transform the SVG into a React component with custom transformations
      const jsx = await transform(svg, options, { componentName });
      // Write the resulting JSX code to the output file
      await writeJsxToTsFile(outputFilePath, jsx);
      console.info(`Generated ${componentName} React Native Component`);
    }
    return { error: undefined };
  } catch (error: any) {
    console.error(`Failed to generate ${componentName} React Native Component`, error);
    // @ts-expect-error - TS doesn't know about our custom cause property
    return { error: new Error(componentName, { cause: error }) };
  }
};

/**
 * Read all files from the SVG directory
 *
 * @param sourceFilePath - Path where the SVGs are stored
 * @param targetFilePath - Path where the React Native components will be stored
 * @returns A Promise that resolves when all components have been generated.
 * @throws An error if any component fails to generate.
 */
const convertSVGtoComponent = async (sourceFilePath?: string, targetFilePath?: string) => {
  try {
    // Directory containing SVGs
    const svgsDir = path.join(sourceFilePath ?? SOURCE_PATH);

    // Directory to store the React Native components
    const outputDir = path.join(targetFilePath ?? TARGET_PATH);

    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const files = fs.readdirSync(svgsDir);
    const svgFiles = files.filter((file) => path.extname(file) === '.svg');

    const results = await Promise.allSettled(
      svgFiles.map((file) => generateComponent(svgsDir, outputDir, file))
    );
    const failComponents = [];
    for (const result of results) {
      // @ts-expect-error - TS doesn't know about our custom value property
      const error = result?.value?.error;
      if (error) {
        failComponents.push(error.message);
      }
    }
    await generateIndexFile(outputDir);
    if (failComponents.length > 0) {
      throw new Error(`Error during SVG conversion: ${failComponents.join(', ')}`);
    }
  } catch (error: any) {
    // @ts-expect-error - TS doesn't know about our custom cause property
    throw new Error(`Error during SVG conversion: ${error.message}`, { cause: error });
  }
};

/**
 * CLI function to convert SVG files into React Native components.
 */
const main = () => {
  program
    .version('1.0.0')
    .description('Convert svg files to React Native components')
    .option('-s, --source <source>', 'Path where the ')
    .option('-t, --target <target>', 'Path where the React Native components will be stored')
    .action(async (cmdOptions) => {
      await convertSVGtoComponent(cmdOptions.source, cmdOptions.target);
    });

  program.parse(process.argv);
};

main();
