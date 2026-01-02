/* eslint-disable import/no-extraneous-dependencies */
import path from 'node:path';
import { program } from 'commander';
import fs from 'fs-extra';
import inquirer from 'inquirer';
import {
  toPascalCase,
  toCamelCase,
  toKebabCase,
  toUpperFirst,
  getRelativePath,
  checkLineExists,
  writeJsxToTsFile
} from './commonMethod';
import {
  ComponentTemplate,
  ScreenTemplate,
  StyleTemplate,
  ComponentTypeTemplate,
  ScreenTypeTemplate,
  HookTemplate,
  ComponentIndexTemplate,
  ScreenIndexTemplate,
  SliceInitialTemplate,
  SliceSelectorTemplate,
  SliceReducerTemplate,
  SliceIndexTemplate,
  CustomHookTemplate
} from './templates';

const THEME_PATH = 'app/theme';
const HOOK_PATH = 'app/hooks';
const STORE_PATH = 'app/redux/Store';
const COMPONENTS_PATH = 'app/components';
const MODULES_PATH = 'app/modules';
const REDUX_PATH = 'app/redux';

/**
 * Generates a React component or screen based on the given type and file name.
 *
 * @param {string} fileType - The type of component to generate, either 'component' or 'screen'.
 * @param {string} fileName - The name of the component to generate.
 * @param {string} filePath - The path to the directory where the component should be generated.
 * @returns {Promise<void>} A promise that resolves once the component or screen is generated.
 * @throws {Error} If the target directory already exists.
 */
const generateComponentOrScreen = async (
  fileType: string,
  fileName: string,
  filePath: string
): Promise<void> => {
  // Convert name to PascalCase
  const pascalCaseName = toPascalCase(fileName);

  // Convert name to camelCase for style import
  const camelCaseName = toCamelCase(fileName);

  // Convert the last part of the path to kebab-case and join with the previous path
  const kebabCaseDir = toKebabCase(fileName);
  const targetDir = path.join(filePath, kebabCaseDir);

  // Check if the target directory already exists
  if (fs.existsSync(targetDir)) {
    throw new Error(
      `Creation failed: A folder named "${kebabCaseDir}" already exists at ${targetDir}.`
    );
  }

  // Create directories if they don't exist
  fs.mkdirSync(targetDir, { recursive: true });
  console.info(`Generating ${targetDir}`);

  // Create component hook
  await writeJsxToTsFile(
    path.join(targetDir, `use${pascalCaseName}.ts`),
    HookTemplate({
      type: fileType,
      hookName: pascalCaseName
    })
  );

  // Create component style
  const currentThemeDir = path.join(THEME_PATH);
  const currentHookDir = path.join(HOOK_PATH);
  const relativeThemePath = getRelativePath(targetDir, currentThemeDir);
  const relativeHookPath = getRelativePath(targetDir, currentHookDir);
  await writeJsxToTsFile(
    path.join(targetDir, `${pascalCaseName}Styles.ts`),
    StyleTemplate({
      relativeThemePath: relativeThemePath,
      relativeHookPath: relativeHookPath,
      componentName: pascalCaseName,
      styleName: camelCaseName,
      fileType: fileType
    })
  );

  // Create component, type and index
  if (fileType === 'screen') {
    await writeJsxToTsFile(
      path.join(targetDir, `${pascalCaseName}Screen.tsx`),
      ScreenTemplate({
        screenName: pascalCaseName
      })
    );

    await writeJsxToTsFile(
      path.join(targetDir, `${pascalCaseName}Types.ts`),
      ScreenTypeTemplate({
        screenName: pascalCaseName
      })
    );

    await writeJsxToTsFile(
      path.join(targetDir, 'index.ts'),
      ScreenIndexTemplate({
        screenName: pascalCaseName
      })
    );
  } else {
    await writeJsxToTsFile(
      path.join(targetDir, `${pascalCaseName}.tsx`),
      ComponentTemplate({
        componentName: pascalCaseName,
        props: `{}: ${pascalCaseName}Props`,
        propsImport: `${pascalCaseName}Props`
      })
    );

    await writeJsxToTsFile(
      path.join(targetDir, `${pascalCaseName}Types.ts`),
      ComponentTypeTemplate({
        componentName: pascalCaseName,
        styleName: camelCaseName
      })
    );

    await writeJsxToTsFile(
      path.join(targetDir, 'index.ts'),
      ComponentIndexTemplate({
        componentName: pascalCaseName
      })
    );
  }

  // Update the appropriate index file
  const indexDir = path.join(filePath);
  const indexPath = path.join(indexDir, 'index.ts');

  const exportStatement = `export * from './${kebabCaseDir}';\n`;
  const isLineExist = await checkLineExists(indexPath, exportStatement.replaceAll('\n', ''));
  if (!fs.existsSync(indexPath)) {
    fs.writeFileSync(indexPath, exportStatement);
  } else if (!isLineExist) {
    fs.appendFileSync(indexPath, exportStatement);
  }
  console.info(`${toUpperFirst(fileType)} ${fileName} created successfully in ${targetDir}`);
};

/**
 * Generates a Redux slice with the given type and file name.
 *
 * @param {string} fileType - The type of slice to generate.
 * @param {string} fileName - The name of the slice to generate.
 * @param {string} filePath - The path to the directory where the component should be generated.
 * @returns {Promise<void>} A promise that resolves once the slice is generated.
 */
const generateSlice = async (
  fileType: string,
  fileName: string,
  filePath: string
): Promise<void> => {
  // Convert name to PascalCase
  const pascalCaseName = toPascalCase(fileName);

  // Convert name to camelCase for style import
  const camelCaseName = toCamelCase(fileName);

  // Convert the last part of the path to kebab-case and join with the previous path
  const kebabCaseDir = toKebabCase(fileName);
  const targetDir = path.join(filePath, kebabCaseDir);

  // Check if the target directory already exists
  if (fs.existsSync(targetDir)) {
    throw new Error(
      `Creation failed: A folder named "${kebabCaseDir}" already exists at ${targetDir}.`
    );
  }

  // Create directories if they don't exist
  fs.mkdirSync(targetDir, { recursive: true });

  await writeJsxToTsFile(
    path.join(targetDir, `${pascalCaseName}Initial.ts`),
    SliceInitialTemplate({
      sliceName: pascalCaseName,
      reducerName: camelCaseName
    })
  );

  const currentReduxDir = path.join(STORE_PATH);
  const relativeReduxPath = getRelativePath(targetDir, currentReduxDir);
  await writeJsxToTsFile(
    path.join(targetDir, `${pascalCaseName}Selector.ts`),
    SliceSelectorTemplate({
      sliceName: pascalCaseName,
      reducerName: camelCaseName,
      relativeReduxPath: relativeReduxPath
    })
  );

  await writeJsxToTsFile(
    path.join(targetDir, `${pascalCaseName}Slice.ts`),
    SliceReducerTemplate({
      sliceName: pascalCaseName,
      reducerName: camelCaseName
    })
  );

  // Create index file
  await writeJsxToTsFile(
    path.join(targetDir, 'index.ts'),
    SliceIndexTemplate({
      sliceName: pascalCaseName
    })
  );

  // Update the appropriate index file
  const indexDir = path.join(filePath);
  const indexPath = path.join(indexDir, 'index.ts');

  const exportStatement = `export * from './${kebabCaseDir}';\n`;
  const isLineExist = await checkLineExists(indexPath, exportStatement.replaceAll('\n', ''));
  if (!fs.existsSync(indexPath)) {
    fs.writeFileSync(indexPath, exportStatement);
  } else if (!isLineExist) {
    fs.appendFileSync(indexPath, exportStatement);
  }
  console.info(`${toUpperFirst(fileType)} ${fileName} created successfully in ${targetDir}`);
};

/**
 * Generates a custom React hook based on the given type and file name.
 * Creates a TypeScript file for the hook and updates the index file in the specified directory
 * to include an export statement for the new hook.
 *
 * @param {string} fileType - The type of the hook to generate.
 * @param {string} fileName - The name of the hook to generate.
 * @param {string} filePath - The path to the directory where the hook should be generated.
 * @returns {Promise<void>} A promise that resolves once the hook is generated and the index is updated.
 */
const generateHook = async (
  fileType: string,
  fileName: string,
  filePath: string
): Promise<void> => {
  // Convert name to PascalCase
  const pascalCaseName = toPascalCase(fileName);

  // Create component hook
  await writeJsxToTsFile(
    path.join(filePath, `use${pascalCaseName}.ts`),
    CustomHookTemplate({
      type: fileType,
      hookName: pascalCaseName
    })
  );

  // Update the appropriate index file
  const indexDir = path.join(filePath);
  const indexPath = path.join(indexDir, 'index.ts');

  const exportStatement = `export { default as use${pascalCaseName}, type Use${pascalCaseName}HookReturn } from './use${pascalCaseName}';\n`;
  const isLineExist = await checkLineExists(indexPath, exportStatement.replaceAll('\n', ''));
  if (!fs.existsSync(indexPath)) {
    fs.writeFileSync(indexPath, exportStatement);
  } else if (!isLineExist) {
    fs.appendFileSync(indexPath, exportStatement);
  }
  console.info(`${toUpperFirst(fileType)} ${fileName} created successfully in ${filePath}`);
};

/**
 * Generates a component, screen, or slice with the given type and file name.
 *
 * @param {string} fileType - The type of file to generate ('component', 'screen', or 'slice').
 * @param {string} fileName - The name of the file to generate.
 * @param {string} filePath - The path to the directory where the file should be generated.
 * @returns {Promise<void>} A promise that resolves once the file is generated.
 * @throws {Error} If the file type is not recognized or if there is an error during generation.
 */
const generateFiles = async (
  fileType: string,
  fileName: string,
  filePath: string
): Promise<void> => {
  try {
    switch (fileType) {
      case 'component':
        await generateComponentOrScreen(
          fileType,
          fileName ?? 'Component',
          filePath ?? COMPONENTS_PATH
        );
        break;
      case 'screen':
        await generateComponentOrScreen(fileType, fileName ?? 'Screen', filePath ?? MODULES_PATH);
        break;
      case 'slice':
        await generateSlice(fileType, fileName ?? 'Slice', filePath ?? REDUX_PATH);
        break;
      case 'hook':
        await generateHook(fileType, fileName ?? 'Hook', filePath ?? HOOK_PATH);
        break;
      default:
        throw new Error('Please select file type');
    }
  } catch (error: any) {
    // @ts-expect-error - error type
    throw new Error(`Error generating file: ${error.message}`, { cause: error });
  }
};

const prompt = inquirer.createPromptModule();

/**
 * CLI function to convert SVG files into React Native components.
 */
const main = () => {
  program
    .version('1.0.0')
    .description('Generate a new React Native component, screen, slice, or hook')
    .argument('<name>', 'Name of the component, screen, slice, or hook')
    .option('-p, --path <path>', 'Path where the component or screen should be created')
    .action(async (name, cmdOptions) => {
      // Prompt the user to select the type of file (component or screen)
      const { type } = await prompt([
        {
          type: 'list',
          name: 'type',
          message: 'Select the type of file to generate:',
          choices: ['component', 'screen', 'slice', 'hook'],
          default: 'component'
        }
      ]);
      await generateFiles(type, name, cmdOptions.path);
    });

  program.parse(process.argv);
};

main();
