const reactNativeConfig = require('@react-native/eslint-config');
const { FlatCompat } = require('@eslint/eslintrc');
const compat = new FlatCompat({ baseDirectory: __dirname });
const typescriptEslint = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');
const react = require('eslint-plugin-react');
const reactHooks = require('eslint-plugin-react-hooks');
const reactNative = require('eslint-plugin-react-native');
const importPlugin = require('eslint-plugin-import');
const prettierPlugin = require('eslint-plugin-prettier');
const prettierConfig = require('eslint-config-prettier');
const eslintComments = require('eslint-plugin-eslint-comments');
const jest = require('eslint-plugin-jest');
const jsdoc = require('eslint-plugin-jsdoc');

const OFF = 0;
const WARN = 1;
const ERROR = 2;

const config = [
  // ==================== Ignore Patterns ====================
  {
    ignores: [
      '**/node_modules/**',
      '**/android/**',
      '**/ios/**',
      '**/build/**',
      '**/dist/**',
      '**/coverage/**',
      '**/.bundle/**',
      '**/vendor/**',
      '**/babel.config.js',
      '**/metro.config.js',
      '**/react-native.config.js',
      '**/eslint.config.js',
      '**/*.d.ts'
    ]
  },

  // ==================== React Native Base Config (via FlatCompat) ====================
  ...compat.config(reactNativeConfig),

  // ==================== Disable legacy Flow rules from RN config ====================
  {
    files: ['*.js', '*.jsx'],
    rules: {
      'ft-flow/define-flow-type': OFF,
      'ft-flow/use-flow-type': OFF
    }
  },

  // ==================== Prettier Config ====================
  prettierConfig,

  // ==================== TypeScript Files ====================
  {
    files: ['**/*.{ts,tsx}'],

    plugins: {
      '@typescript-eslint': typescriptEslint,
      'eslint-comments': eslintComments,
      react,
      'react-hooks': reactHooks,
      'react-native': reactNative,
      prettier: prettierPlugin,
      jest,
      import: importPlugin,
      jsdoc
    },

    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2018,
      sourceType: 'module',

      parserOptions: {
        ecmaFeatures: {
          jsx: true
        },
        project: './tsconfig.json',
        tsconfigRootDir: __dirname
      },

      globals: {
        // React Native globals
        __DEV__: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        __fbBatchedBridgeConfig: 'readonly',

        // Browser/RN globals
        alert: 'readonly',
        cancelAnimationFrame: 'readonly',
        cancelIdleCallback: 'readonly',
        clearImmediate: 'readonly',
        clearInterval: 'readonly',
        clearTimeout: 'readonly',
        console: 'readonly',
        document: 'readonly',
        escape: 'readonly',
        Event: 'readonly',
        EventTarget: 'readonly',
        fetch: 'readonly',
        FormData: 'readonly',
        navigator: 'readonly',
        requestAnimationFrame: 'readonly',
        requestIdleCallback: 'readonly',
        setImmediate: 'readonly',
        setInterval: 'readonly',
        setTimeout: 'readonly',
        window: 'readonly',
        XMLHttpRequest: 'readonly',

        // Node/Module globals
        exports: 'writable',
        global: 'readonly',
        module: 'writable',
        process: 'readonly',
        require: 'readonly',

        // ES6+ globals
        Map: 'readonly',
        Promise: 'readonly',
        Set: 'readonly',

        // Jest globals
        jest: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',

        // TypeScript
        JSX: 'readonly'
      }
    },

    settings: {
      react: {
        version: 'detect'
      },
      'import/resolver': {
        // 'babel-module': {
        //   extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
        //   alias: {
        //     '@app': './app',
        //     '@assets': './app/assets',
        //     '@components': './app/components',
        //     '@configs': './app/configs',
        //     '@constants': './app/constants',
        //     '@hooks': './app/hooks',
        //     '@modules': './app/modules',
        //     '@navigation': './app/navigation',
        //     '@redux': './app/redux',
        //     '@themes': './app/themes',
        //     '@translations': './app/translations',
        //     '@types': './app/types',
        //     '@utils': './app/utils'
        //   }
        // },
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json'
        },
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
          moduleDirectory: ['node_modules']
        }
      },
      'import/extensions': ['.js', '.jsx', '.ts', '.tsx'],
      'import/parsers': {
        '@typescript-eslint/parser': ['.ts', '.tsx']
      },
      // 'import/ignore': ['react-native'],
      // 'import/core-modules': ['react-native']
      'import/external-module-folders': ['node_modules', 'node_modules/@types']
    },

    rules: {
      // ==================== Prettier ====================
      'prettier/prettier': [
        ERROR,
        {},
        {
          usePrettierrc: true
        }
      ],

      // ==================== General ====================
      indent: [
        OFF,
        2,
        {
          SwitchCase: 1,
          VariableDeclarator: 1,
          outerIIFEBody: 1,
          FunctionDeclaration: {
            parameters: 1,
            body: 1
          },
          FunctionExpression: {
            parameters: 1,
            body: 1
          },
          flatTernaryExpressions: true,
          offsetTernaryExpressions: true
        }
      ],
      'global-require': OFF,
      'no-plusplus': OFF,
      'no-cond-assign': OFF,
      'max-classes-per-file': [ERROR, 10],
      'no-shadow': OFF,
      'no-undef': OFF,
      'no-bitwise': OFF,
      'no-param-reassign': OFF,
      'no-use-before-define': OFF,
      'linebreak-style': [ERROR, 'unix'],
      semi: [ERROR, 'always'],
      'comma-dangle': [
        ERROR,
        {
          arrays: 'never',
          objects: 'never',
          imports: 'never',
          exports: 'never',
          functions: 'ignore'
        }
      ],
      'object-curly-spacing': [ERROR, 'always'],
      'array-bracket-spacing': [ERROR, 'never'],
      'eol-last': [ERROR, 'always'],
      'no-console': OFF,
      'no-restricted-syntax': [
        WARN,
        {
          selector:
            "CallExpression[callee.object.name='console'][callee.property.name!=/^(warn|error|info|trace|disableYellowBox|tron)$/]",
          message: 'Unexpected property on console object was called'
        }
      ],

      eqeqeq: [WARN, 'always'],
      quotes: [ERROR, 'single', { avoidEscape: true, allowTemplateLiterals: false }],
      'no-duplicate-imports': ERROR,
      'no-var': ERROR,
      'prefer-const': ERROR,
      'no-unused-vars': OFF,

      // ==================== JSDoc ====================
      'jsdoc/require-jsdoc': [
        WARN,
        {
          require: {
            FunctionDeclaration: true,
            MethodDefinition: true,
            ClassDeclaration: true,
            ArrowFunctionExpression: true,
            FunctionExpression: true
          },
          contexts: ['TSInterfaceDeclaration', 'TSTypeAliasDeclaration', 'TSEnumDeclaration']
        }
      ],
      'jsdoc/require-description': WARN,
      'jsdoc/require-param': WARN,
      'jsdoc/require-param-description': WARN,
      'jsdoc/require-param-name': ERROR,
      'jsdoc/require-param-type': OFF, // TypeScript handles types
      'jsdoc/require-returns': WARN,
      'jsdoc/require-returns-description': WARN,
      'jsdoc/require-returns-type': OFF, // TypeScript handles types
      'jsdoc/check-alignment': ERROR,
      'jsdoc/check-indentation': WARN,
      'jsdoc/check-param-names': ERROR,
      'jsdoc/check-tag-names': ERROR,
      'jsdoc/check-types': OFF, // TypeScript handles types
      'jsdoc/no-undefined-types': OFF, // TypeScript handles types
      'jsdoc/valid-types': OFF, // TypeScript handles types
      'jsdoc/check-syntax': ERROR,
      'jsdoc/no-multi-asterisks': [ERROR, { allowWhitespace: true }],
      'jsdoc/tag-lines': [ERROR, 'any', { startLines: 1 }],

      // ==================== TypeScript ====================
      '@typescript-eslint/no-shadow': [ERROR],
      '@typescript-eslint/no-use-before-define': [ERROR],
      '@typescript-eslint/no-unused-vars': [
        ERROR,
        {
          args: 'all',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true
        }
      ],
      '@typescript-eslint/consistent-type-definitions': [ERROR, 'interface'],
      '@typescript-eslint/ban-ts-comment': WARN,
      '@typescript-eslint/no-explicit-any': OFF,
      '@typescript-eslint/explicit-module-boundary-types': OFF,
      '@typescript-eslint/no-non-null-assertion': WARN,
      '@typescript-eslint/no-require-imports': OFF,
      '@typescript-eslint/no-var-requires': WARN,
      '@typescript-eslint/consistent-type-imports': [
        ERROR,
        {
          prefer: 'type-imports',
          disallowTypeAnnotations: false
        }
      ],
      '@typescript-eslint/indent': [
        OFF,
        2,
        {
          SwitchCase: 1,
          VariableDeclarator: 1,
          outerIIFEBody: 1,
          FunctionDeclaration: {
            parameters: 1,
            body: 1
          },
          FunctionExpression: {
            parameters: 1,
            body: 1
          },
          flatTernaryExpressions: true,
          offsetTernaryExpressions: true
        }
      ],

      // ==================== Imports ====================
      'import/extensions': OFF,
      'import/prefer-default-export': OFF,
      'import/no-cycle': OFF,
      'import/order': [
        ERROR,
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
            'object',
            'type'
          ],
          pathGroups: [
            {
              pattern: 'react',
              group: 'builtin',
              position: 'before'
            },
            {
              pattern: 'react-native',
              group: 'builtin',
              position: 'before'
            },
            {
              pattern: '@react-native/**',
              group: 'external',
              position: 'after'
            },
            {
              pattern: '@/**',
              group: 'internal',
              position: 'before'
            }
          ],
          pathGroupsExcludedImportTypes: ['react', 'react-native'],
          alphabetize: {
            order: 'asc',
            caseInsensitive: true
          },
          warnOnUnassignedImports: true
        }
      ],
      'import/no-unresolved': [ERROR, { commonjs: true, amd: true }],
      'import/named': ERROR,
      'import/namespace': ERROR,
      'import/default': ERROR,
      'import/export': ERROR,
      'import/no-extraneous-dependencies': [
        ERROR,
        {
          devDependencies: [
            '**/*.test.ts',
            '**/*.test.tsx',
            '**/*.spec.ts',
            '**/*.spec.tsx',
            '**/__tests__/**',
            '**/__mocks__/**',
            '**/jest.setup.ts',
            '**/jest.config.js'
          ]
        }
      ],
      'import/no-duplicates': ERROR,
      'import/newline-after-import': ERROR,

      // ==================== React Hooks ====================
      'react-hooks/exhaustive-deps': ERROR,
      'react-hooks/rules-of-hooks': ERROR,

      // ==================== React ====================
      'react/jsx-props-no-spreading': OFF,
      'react/jsx-filename-extension': [ERROR, { extensions: ['.js', '.jsx', '.ts', '.tsx'] }],
      'react/no-unescaped-entities': [ERROR, { forbid: ['>', '"', '}'] }],
      'react/prop-types': [ERROR, { ignore: ['action', 'dispatch', 'nav', 'navigation'] }],
      'react/display-name': OFF,
      'react/jsx-boolean-value': ERROR,
      'react/jsx-no-undef': ERROR,
      'react/jsx-uses-react': ERROR,
      'react/jsx-uses-vars': ERROR,
      'react/jsx-sort-props': [
        ERROR,
        {
          callbacksLast: true,
          shorthandFirst: true,
          ignoreCase: true,
          noSortAlphabetically: true,
          reservedFirst: true
        }
      ],
      'react/jsx-pascal-case': ERROR,
      'react/no-children-prop': OFF,
      'react/self-closing-comp': ERROR,
      'react/jsx-curly-brace-presence': [ERROR, { props: 'never', children: 'never' }],
      'react/react-in-jsx-scope': OFF,
      'react/jsx-key': ERROR,

      // ==================== React Native Specific Rules ====================
      'react-native/no-unused-styles': ERROR,
      'react-native/no-inline-styles': ERROR,
      'react-native/no-color-literals': ERROR,
      'react-native/no-raw-text': [
        ERROR,
        {
          skip: ['CustomText', 'Text', 'Tag', 'Button']
        }
      ],
      'react-native/split-platform-components': WARN,
      'react-native/no-single-element-style-arrays': ERROR,

      // ==================== Jest ====================
      'jest/no-disabled-tests': WARN,
      'jest/no-focused-tests': ERROR,
      'jest/no-identical-title': ERROR,
      'jest/valid-expect': ERROR,

      // ==================== ESLint Comments ====================
      'eslint-comments/no-unused-disable': WARN
    }
  },

  // ==================== GraphQL Files ====================
  {
    files: ['**/*.graphql.ts'],
    rules: {
      'jsdoc/require-jsdoc': OFF
    }
  },

  // ==================== Test Files ====================
  {
    files: [
      '**/*.test.ts',
      '**/*.test.tsx',
      '**/*.spec.ts',
      '**/*.spec.tsx',
      '**/__tests__/**/*.{ts,tsx,js,jsx}',
      '**/__mocks__/**/*.{ts,tsx,js,jsx}'
    ],
    rules: {
      'jsdoc/require-jsdoc': OFF,
      '@typescript-eslint/no-explicit-any': OFF,
      'react-native/no-inline-styles': OFF,
      'react-native/no-color-literals': OFF,
      'no-console': OFF
    }
  },

  // ==================== Config Files ====================
  {
    files: [
      '*.config.js',
      '*.config.ts',
      'babel.config.js',
      'metro.config.js',
      'react-native.config.js',
      'eslint.config.js'
    ],
    rules: {
      'jsdoc/require-jsdoc': OFF,
      '@typescript-eslint/no-var-requires': OFF,
      '@typescript-eslint/no-require-imports': OFF,
      'global-require': OFF
    }
  },

  // ==================== Type Definition Files ====================
  {
    files: ['**/*.d.ts'],
    rules: {
      'jsdoc/require-jsdoc': OFF,
      '@typescript-eslint/no-explicit-any': OFF,
      'no-var': OFF
    }
  }
];

module.exports = config;
