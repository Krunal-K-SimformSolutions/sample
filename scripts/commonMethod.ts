/* eslint-disable import/no-extraneous-dependencies */
import path from 'node:path';
import readline from 'node:readline';
import { ESLint } from 'eslint';
import fs from 'fs-extra';
import _ from 'lodash';
import prettier from 'prettier';

/**
 * Helper function to convert string to PascalCase using lodash-es
 *
 * @param str - input string
 * @returns PascalCase string
 */
export const toPascalCase = (str?: string): string => {
  return _.startCase(_.camelCase(str)).replaceAll(' ', '');
};

/**
 * Helper function to convert string to camelCase using lodash-es
 *
 * @param str - input string
 * @returns camelCase string
 */
export const toCamelCase = (str?: string): string => {
  return _.camelCase(str);
};

/**
 * Helper function to convert string to kebab-case using lodash-es
 *
 * @param str - input string
 * @returns kebab-case string
 */
export const toKebabCase = (str?: string): string => {
  return _.kebabCase(str);
};

/**
 * Helper function to capitalize the first letter of a string using lodash-es
 *
 * @param str - input string
 * @returns string with first letter capitalized
 */
export const toUpperFirst = (str?: string): string => {
  return _.upperFirst(str);
};

/**
 * Helper function to lower the first letter of a string using lodash-es
 *
 * @param str - input string
 * @returns string with first letter in lowercase
 */
export const toLowerFirst = (str?: string): string => {
  return _.lowerFirst(str);
};

/**
 * Function to calculate how many ../ needed to reach targetDir from currentDir
 *
 * @param currentDir - current directory
 * @param targetDir - target directory
 * @returns relative path from currentDir to targetDir
 */
export const getRelativePath = (currentDir: string, targetDir: string): string => {
  const dirs = currentDir.split('/');
  const index = dirs.indexOf('app');
  const finalCurrentDir = dirs.slice(index).join('/');
  // Get the relative path between the current and target directory
  const relativePath = path.relative(finalCurrentDir, targetDir);

  // If the relative path starts with "..", we need to add ../ to go up directories
  return relativePath;
};

/**
 * Returns the current directory name of the script being executed.
 *
 * @returns The current directory name.
 */
export const getModuleDirName = (): string => {
  return __dirname.replace('scripts', '');
};

/**
 * Formats a string of JSX code.
 *
 * @param {string} jsx - The JSX code string to format.
 * @returns {Promise<string>} - The formatted JSX code string.
 * @throws {Error} - If the Prettier configuration file is not found.
 *
 * This function uses Prettier to format the given JSX code string.
 * The configuration file used is the one located next to the current file,
 * at `.prettierrc.js`. The function returns a promise that resolves with the
 * formatted JSX code string.
 */
export const formateJsxWithPrettier = async (jsx: string): Promise<string> => {
  const dirName = getModuleDirName();

  // Load Prettier config from the specified file
  const config = await prettier.resolveConfig(path.resolve(dirName, '.prettierrc.js'), {
    config: path.resolve(dirName, '.prettierrc.js')
  });

  if (!config) {
    throw new Error('Could not find or load Prettier config file.');
  }

  // Format the code string synchronously
  const jsxCode = prettier.format(jsx, {
    ...config,
    parser: 'babel-ts' // Use Babel parser for JavaScript/JSX
  });

  return jsxCode;
};

/**
 * Formats a string of JSX code with ESLint.
 *
 * @param {string} jsx - The JSX code string to format.
 * @returns {Promise<string>} - The formatted JSX code string.
 * @throws {Error} - If the ESLint configuration file is not found.
 *
 * This function uses ESLint to lint and fix the given JSX code string.
 * The configuration file used is the one located next to the current file,
 * at `../eslint.config.mjs`. If no configuration file is found, the function
 * will throw an error. The function returns a promise that resolves with the
 * formatted JSX code string, or the original string if no fixes were made.
 */
export const formatJsxWithEslint = async (jsx: string): Promise<string> => {
  // Create an ESLint instance
  const eslint = new ESLint({
    fix: true, // Automatically fix problems where possible
    overrideConfigFile: path.resolve(getModuleDirName(), '.eslintrc.js')
  });

  // Lint and fix the JSX content
  const results = await eslint.lintText(jsx);

  // Apply the fixes and return the formatted code
  await ESLint.outputFixes(results);

  // Return the formatted JSX
  return results?.[0]?.output || jsx; // Return the fixed output or the original if no fixes
};

/**
 * Checks if a line exists in a file.
 *
 * @param {string} filePath - The path to the file to check.
 * @param {string} targetLine - The line to check for.
 * @returns {Promise<boolean>} - A promise that resolves to true if the line exists, false otherwise.
 */
export const checkLineExists = async (filePath: string, targetLine: string): Promise<boolean> => {
  const fileStream = fs.createReadStream(filePath);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let lineExists = false;

  for await (const line of rl) {
    if (line === targetLine) {
      lineExists = true;
      break;
    }
  }

  return lineExists;
};

/**
 * Retrieves the directory path from the provided file path.
 *
 * @param {string} [filePath] - Optional file path from which to extract the directory.
 * @returns {string | undefined} - The directory path if the file path is valid, otherwise undefined.
 */
export const getDirectorPath = (filePath?: string): string | undefined => {
  return (filePath?.length ?? 0) > 0 ? path.dirname(filePath ?? '') : undefined;
};

/**
 * Write a JSX string to a file after formatting it with ESLint and Prettier.
 *
 * @param filePath - The path to write the file to.
 * @param jsx - The JSX string to write to the file.
 * @returns A Promise that resolves when the file has been written.
 * @throws An error if formatting or writing the file fails.
 */
export const writeJsxToTsFile = async (
  filePath: fs.PathOrFileDescriptor,
  jsx: string
): Promise<void> => {
  try {
    const esLintContents = await formatJsxWithEslint(jsx);
    const prettierContents = await formateJsxWithPrettier(esLintContents);
    return fs.writeFile(filePath, prettierContents.trim().concat('\n'));
  } catch (error) {
    console.error(filePath, jsx, error);
    throw error;
  }
};
