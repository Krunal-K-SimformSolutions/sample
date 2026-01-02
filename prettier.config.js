/**
 * @see https://prettier.io/docs/configuration
 * @type {import("prettier").Config}
 */
const config = {
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
};

module.exports = config;
