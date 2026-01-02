/* eslint-disable import/no-extraneous-dependencies */
import path from 'node:path';
import { program } from 'commander';
import fs from 'fs-extra';
import { checkLineExists, getRelativePath, toPascalCase } from './commonMethod.ts';

const JSON_FILE_PATH = 'app/translations/en.json';
const STRING_CONST_FILE_PATH = 'app/constants';
const CONFIG_PATH = 'app/configs';

/**
 * Generates a TypeScript file containing constants for translated strings, given a JSON file containing the strings.
 * The generated file will contain constants for each string in the JSON file, with the name of the constant being
 * the PascalCase version of the key in the JSON file. The value of the constant will be a call to,
 * with the key as the first argument, and any variables in the string as additional arguments.
 *
 * @param {string} [sourceFilePath] - The path to the JSON file containing the strings, relative to the current working directory.
 * @param {string} [targetFilePath] - The path to the file where the generated TypeScript code should be written, relative to the current working directory.
 * @returns {Promise<void>} A promise that resolves once the file is generated.
 * @throws {Error} If there is an error reading the JSON file or writing the TypeScript file.
 */
const generateStringConstWithI18n = async (
  sourceFilePath: string,
  targetFilePath: string
): Promise<void> => {
  try {
    // File containing strings
    const jsonFilePath = path.join(sourceFilePath ?? JSON_FILE_PATH);

    // File containing strings
    const outputFilePath = path.join(targetFilePath ?? STRING_CONST_FILE_PATH);

    const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));

    const currentThemeDir = path.join(CONFIG_PATH);
    const relativeThemePath = getRelativePath(targetFilePath ?? '', currentThemeDir);

    let result = `import { i18n } from '${relativeThemePath}';\n\n`;

    /**
     * Recursively generates TypeScript code from the JSON structure.
     *
     * @param {Record<string, any>} obj - The current JSON object.
     * @param {string} parentKey - The parent key to prefix nested keys.
     * @returns {string} - The TypeScript code generated for the object.
     */
    const generateTSFromJSON = (obj: Record<string, any>, parentKey: string = ''): string => {
      let output = '';

      for (const key of Object.keys(obj)) {
        const fullKey = parentKey ? `${parentKey}:${key}` : key;
        const value = obj[key];

        if (typeof value === 'string') {
          if (value.includes('{{')) {
            // Handle strings with variables like {{firstName}}
            const args = value.match(/{{(.*?)}}/g)?.map((v) => v.replaceAll(/[{}]/g, '')) ?? [];
            const argString = args.map((arg) => `${arg}: string`).join(', ');
            output += `  ${key.trim()}: (${argString.trim()}) => i18n.t('${fullKey}', {${args.join(
              ', '
            )}}),\n`;
          } else {
            // Static strings
            output += `  ${key.trim()}: i18n.t('${fullKey}'),\n`;
          }
        } else if (Array.isArray(value)) {
          output += `  ${key.trim()}: i18n.t('${fullKey}', {\n`;
          output += '    returnObjects: true\n';
          output += '  }) as unknown as Array<string>,\n';
        } else if (typeof value === 'object') {
          const pascalKey = toPascalCase(key);
          output += '/**\n';
          output += ` * Contains translated strings for the ${pascalKey} module.\n`;
          output += ' *\n';
          output += ' * @type {Object}\n';
          output += ' */\n';
          output += `const ${pascalKey} = Object.freeze({\n`;
          output += `${generateTSFromJSON(value, fullKey).slice(0, -2)}\n`;
          output += '});\n\n';
        }
      }
      return output;
    };

    // Start generating the TypeScript code
    result += generateTSFromJSON(jsonData);

    const pascalKeys = Object.keys(jsonData).map(toPascalCase);
    result += '/**\n';
    result += ' * Export all the generated modules.\n';
    result += ' *\n';
    result += ' * @type {Object}\n';
    result += ' */\n';
    result += 'export default Object.freeze({\n';
    result += `  ${pascalKeys.join(',\n  ').trimEnd()}\n`;
    result += '});';

    // Write the result to the output file
    fs.writeFileSync(`${outputFilePath}/StringConst.ts`, result, 'utf8');

    // Update the appropriate index file
    const indexDir = path.join(outputFilePath);
    const indexPath = path.join(indexDir, 'index.ts');

    const exportStatement = "export { default as StringConst } from './StringConst';\n";
    const isLineExist = await checkLineExists(indexPath, exportStatement.replaceAll('\n', ''));
    if (!fs.existsSync(indexPath)) {
      fs.writeFileSync(indexPath, exportStatement);
    } else if (!isLineExist) {
      fs.appendFileSync(indexPath, exportStatement);
    }
    console.info(`StringConst.ts generated successfully at ${outputFilePath}`);
  } catch (error: any) {
    throw new Error(`Error generating Strings: ${error.message}`, { cause: error });
  }
};

/**
 * Generates a TypeScript file containing string constants from a JSON file.
 * The generated file will be named "StringConst.ts" and will be placed in the
 * specified target file path.
 *
 * @param {string} sourceFilePath - The file path of the JSON file containing the strings.
 * @param {string} targetFilePath - The file path where the generated TypeScript file should be placed.
 * @returns {Promise<void>} - A promise that resolves when the file has been generated.
 * @throws {Error} - Throws an error if there is an issue reading the JSON file or writing the TypeScript file.
 */
const generateStringConstWithoutI18n = async (
  sourceFilePath: string,
  targetFilePath: string
): Promise<void> => {
  try {
    // File containing strings
    const jsonFilePath = path.join(sourceFilePath ?? JSON_FILE_PATH);

    // File containing strings
    const outputFilePath = path.join(targetFilePath ?? STRING_CONST_FILE_PATH);

    const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));

    let result = '';

    /**
     * Recursively generates TypeScript code from the JSON structure.
     *
     * @param {Record<string, any>} obj - The current JSON object.
     * @param {string} parentKey - The parent key to prefix nested keys.
     * @returns {string} - The TypeScript code generated for the object.
     */
    const generateTSFromJSON = (obj: Record<string, any>, parentKey: string = ''): string => {
      let output = '';

      for (const key of Object.keys(obj)) {
        const fullKey = parentKey ? `${parentKey}:${key}` : key;
        const value = obj[key];

        if (typeof value === 'string') {
          // Handle static strings
          output += `  ${key.trim()}: '${fullKey}',\n`;
        } else if (Array.isArray(value)) {
          // Handle arrays
          output += `  ${key.trim()}: '${fullKey}',\n`;
        } else if (typeof value === 'object' && value !== null) {
          output += `  ${key.trim()}: {
`;
          output += `${generateTSFromJSON(value, fullKey)}`;
          output += '  },\n';
        }
      }
      return output;
    };

    // Generate TypeScript code for the input JSON
    for (const key of Object.keys(jsonData)) {
      const pascalKey = toPascalCase(key);
      result += '/**\n';
      result += ` * Contains translated strings for the ${pascalKey} module.\n`;
      result += ' *\n';
      result += ' * @type {Object}\n';
      result += ' */\n';
      result += `const ${pascalKey} = Object.freeze({\n`;
      result += generateTSFromJSON(jsonData[key], key).slice(0, -2); // Remove trailing comma and newline
      result += '\n});\n\n';
    }

    // Generate the export block
    const pascalKeys = Object.keys(jsonData).map(toPascalCase);
    result += '/**\n';
    result += ' * Export all the generated modules.\n';
    result += ' *\n';
    result += ' * @type {Object}\n';
    result += ' */\n';
    result += 'export default Object.freeze({\n';
    result += `  ${pascalKeys.join(',\n  ').trimEnd()}\n`;
    result += '});\n';

    // Write the result to the output file
    fs.writeFileSync(`${outputFilePath}/StringConst.ts`, result, 'utf8');

    // Update the appropriate index file
    const indexDir = path.join(outputFilePath);
    const indexPath = path.join(indexDir, 'index.ts');

    const exportStatement = "export { default as StringConst } from './StringConst';\n";
    const isLineExist = await checkLineExists(indexPath, exportStatement.replaceAll('\n', ''));
    if (!fs.existsSync(indexPath)) {
      fs.writeFileSync(indexPath, exportStatement);
    } else if (!isLineExist) {
      fs.appendFileSync(indexPath, exportStatement);
    }
    console.info(`StringConst.ts generated successfully at ${outputFilePath}`);
  } catch (error: any) {
    throw new Error(`Error generating Strings: ${error.message}`, { cause: error });
  }
};

/**
 * CLI function to convert SVG files into React Native components.
 */
const main = () => {
  program
    .version('1.0.0')
    .description('Generate TypeScript file containing string constants from a JSON file')
    .argument('<flag>', 'Flag to determine if i18n should be used')
    .option('-s, --source <source>', 'Path where the JSON file containing the strings is located')
    .option('-t, --target <target>', 'Path where the generated TypeScript file should be stored')
    .action(async (flag, cmdOptions) => {
      if (flag === 'true') {
        await generateStringConstWithI18n(cmdOptions.source, cmdOptions.target);
      } else {
        await generateStringConstWithoutI18n(cmdOptions.source, cmdOptions.target);
      }
    });

  program.parse(process.argv);
};

main();
