/**
 * cSpell configuration for spell checking.
 *
 * @type {import('@cspell/cspell-types').CSpellUserSettings}
 */
const config = {
  // Version of the configuration file
  version: '0.2',

  // Language settings
  language: 'en',

  // Enable/disable spell checking
  enabled: true,

  // Allow compound words
  allowCompoundWords: true,

  // Case sensitive checking
  caseSensitive: false,

  // Number of suggestions to make
  numSuggestions: 8,

  // Suggestion mode:  'normal' | 'slow' | 'fast'
  suggestionMode: 'normal',

  // Files and directories to ignore
  ignorePaths: [
    // Dependencies
    'node_modules/**',
    'yarn.lock',

    // Build outputs
    'build/**',
    'dist/**',
    'coverage/**',

    // Native directories
    '.bundle/**',
    'vendor/**',
    '**/vendor/**',

    // Cache and temp files
    '.cache/**',
    '.temp/**',
    '*.log',
    'tempfile',

    // Git
    '.git/**',
    '.gitignore',

    // IDE
    '.vscode/**',
    '.idea/**',
    '*.code-workspace',

    // Config files
    '*.min.js',
    '*.min.css',
    '*.map',
    '**/*.map',
    '**/*.min.js',

    // Assets
    // '*.png',
    // '*.jpg',
    // '*.jpeg',
    // '*.gif',
    // '*.svg',
    // '*.ico',
    // '*.pdf',
    // '*.ttf',
    // '*.woff',
    // '*.woff2',
    // '*.eot',

    // Mobile specific
    '*.mobileprovision',
    '*.hprof',
    '*.jsbundle',
    'Podfile.lock',
    '*.xcconfig',

    // Gradle
    'gradlew',
    'gradlew.bat'
  ],

  // File types to check
  enableFiletypes: ['.js', '.ts', '.tsx', '.jsx', '.json', '.md', '.yaml', '.yml'],

  // File types to disable
  disableFiletypes: ['.log', '.txt'],

  // Enabled language IDs
  enabledLanguageIds: [
    'javascript',
    'javascriptreact',
    'typescript',
    'typescriptreact',
    'json',
    'jsonc',
    'markdown',
    'mdx',
    'yaml',
    'yml',
    'html',
    'css',
    'scss',
    'less'
  ],

  // Words to recognize (project-specific)
  words: [
    // Framework & Libraries
    'ReactNative',
    'NodeJS',
    'reactnative',
    'pressable',
    'touchable',
    'flatlist',
    'scrollview',
    'safeareaview',

    // Tools
    'cspell',
    'eslint',
    'lefthook',
    'prettytable',
    'ansicolor',
    'codegen',
    'gradlew',

    // Company & Project
    'Simform',

    // Git
    'EDITMSG',

    // Project Management
    'Asana',

    // Mobile specific
    'mobileprovision',
    'hprof',
    'jsbundle',
    'Podfile',
    'xcconfig',

    // Template variables
    'projectName',
    'projectNameWithLowerCase',

    // Custom components
    'Svgs',
    'persistor',

    // Spanish words (from your config)
    'Tema',
    'oscuro',
    'Esta',
    'pantalla',
    'existe',
    'inicio',
    'Vaya',
    'Hogar',
    'Llamada',

    // Common tech terms
    'repo',
    'repos',
    'axios',
    'redux',
    'zustand',
    'tanstack',
    'jotai',
    'tailwindcss',
    'clsx',
    'classnames',

    // TypeScript
    'readonly',
    'keyof',
    'typeof',
    'infer',

    // Common abbreviations
    'config',
    'configs',
    'utils',
    'util',
    'func',
    'btn',
    'nav',
    'auth',
    'admin',
    'async',
    'sync',
    'init',
    'dest',
    'src',

    // Environment
    'env',
    'envs',
    'localhost',
    'regex',
    'uri',
    'url',
    'urls',
    'api',
    'apis',
    'http',
    'https',
    'uuid',

    // Common file extensions
    'jsx',
    'tsx',
    'mjs',
    'cjs',

    // Package names
    'prettier',
    'typescript',
    'babel',
    'webpack',
    'vite',
    'rollup',
    'esbuild',
    'metro',

    // Project specific terms
    'mmkv',
    'mths'
  ],

  // Ignore words (won't be flagged as errors)
  ignoreWords: ['todo', 'tempfile'],

  // Flag words (always considered incorrect)
  flagWords: [],

  // Patterns to ignore
  ignoreRegExpList: [
    // Ignore hex colors
    /#[0-9a-fA-F]{3,8}\b/g,

    // Ignore UUIDs
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,

    // Ignore base64 strings
    /data:image\/[^;]+;base64[^"']*/g,

    // Ignore URLs
    /https?:\/\/[^\s"')}\]]+/g,

    // Ignore import paths
    /from\s+['"][^'"]+['"]/g,
    /import\s+.*\s+from\s+['"][^'"]+['"]/g,

    // Ignore require statements
    /require\(['"][^'"]+['"]\)/g,

    // Ignore console statements
    /console\.(log|warn|error|info|debug)\([^)]*\)/g,

    // Ignore version numbers
    /\d+\.\d+\.\d+(-[a-z0-9.]+)?/g,

    // Ignore email addresses
    /[\w.+-]+@[\w.-]+\.[a-z]{2,}/gi,

    // Ignore environment variables
    /process\.env\.[A-Z_]+/g,

    // Ignore JSDoc tags
    /@[a-z]+/g,

    // Ignore template literals with <%= %>
    /<%=?\s*[\w\s-]+\s*-? %>/g,

    // Ignore package.json version patterns
    /"\^?\d+\.\d+\.\d+"/g
  ],

  // Patterns for specific file types
  overrides: [
    // JavaScript/TypeScript files
    {
      filename: '**/*.{js,jsx,ts,tsx}',
      ignoreRegExpList: [
        // Ignore camelCase function names
        /\b[a-z]+[A-Z][a-zA-Z]*\(/g,

        // Ignore UPPER_CASE constants
        /\b[A-Z][A-Z0-9_]+\b/g,

        // Ignore PascalCase class/component names
        /\b[A-Z][a-z]+[A-Z][a-zA-Z]*\b/g
      ]
    },

    // JSON files
    {
      filename: '**/*.json',
      ignoreRegExpList: [
        // Ignore property names in JSON
        /"[^"]+"\s*:/g
      ]
    },

    // Markdown files
    {
      filename: '**/*.md',
      ignoreRegExpList: [
        // Ignore code blocks
        /```[\s\S]*?```/g,

        // Ignore inline code
        /`[^`]+`/g,

        // Ignore links
        /\[([^\]]+)\]\([^)]+\)/g,

        // Ignore image references
        /!\[([^\]]*)\]\([^)]+\)/g
      ]
    },

    // CSS/SCSS files
    {
      filename: '**/*.{css,scss,less}',
      ignoreRegExpList: [
        // Ignore CSS class names
        /\.[a-z][a-zA-Z0-9_-]*/g,

        // Ignore CSS variables
        /--[a-z][a-zA-Z0-9-]*/g,

        // Ignore CSS color values
        /#[0-9a-fA-F]{3,8}/g
      ]
    },

    // Test files
    {
      filename: '**/*.{test,spec}.{js,jsx,ts,tsx}',
      words: [
        'describe',
        'beforeEach',
        'afterEach',
        'beforeAll',
        'afterAll',
        'toEqual',
        'toBe',
        'toHaveBeenCalled',
        'toHaveBeenCalledWith',
        'toMatchSnapshot',
        'toThrow',
        'toBeTruthy',
        'toBeFalsy',
        'toContain'
      ]
    },

    // Config files
    {
      filename: '**/*.config.{js,ts,mjs,cjs}',
      ignoreRegExpList: [
        // Ignore module names
        /require\(['"][^'"]+['"]\)/g,
        /import\s+.*\s+from\s+['"][^'"]+['"]/g
      ]
    },

    // Gradle files
    {
      filename: '**/build.gradle',
      enabled: false
    },

    // Podfile
    {
      filename: '**/Podfile',
      enabled: false
    },

    // Native iOS/Android
    {
      filename: '**/*.{m,h,swift,kt,java}',
      enabled: false
    }
  ],

  // Dictionary definitions
  dictionaries: [
    'typescript',
    'node',
    'javascript',
    'html',
    'css',
    'npm',
    'bash',
    'en-US',
    'companies',
    'softwareTerms',
    'misc'
  ],

  // Use .gitignore
  useGitignore: true,

  // Custom dictionaries path (optional)
  dictionaryDefinitions: [
    {
      name: 'project-words',
      path: './project-words.txt',
      addWords: true
    }
  ],

  // Cache settings
  cache: {
    useCache: false,
    cacheLocation: '.cspell-cache'
  }
};

module.exports = config;
