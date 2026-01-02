const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { withSentryConfig } = require('@sentry/react-native/metro');

const blockListPatterns = [
  // Tests and mocks
  /node_modules\/.*\/__(tests|mocks)__\/.*/,
  /.*\/__tests__\/.*/,
  /.*\.test\.[jt]sx?$/,
  /.*\.spec\.[jt]sx?$/,

  // Version control and IDE
  /node_modules\/.*\/\.git\/.*/,
  /node_modules\/.*\/\.github\/.*/,
  /.*\.vscode\/.*/,

  // Documentation
  /.*\.md$/,

  // Build artifacts
  /.*\/coverage\/.*/,
  /.*\/dist\/.*/,

  // Workspace-specific folders
  /scripts\/.*/,
  /vendor\/.*/,
  /\.bundle\/.*/,
  /\.lefthook\/.*/,
  /\.yarn\/.*/,

  // Single files
  /\.lefthook\.yml$/,
  /cspell\.config\.js$/,
  /eslint\.config\.js$/,
  /jest\.config\.js$/,
  /prettier\.config\.js$/
];

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  resolver: {
    unstable_enablePackageExports: false,
    resolverMainFields: ['react-native', 'main', 'module']
    // blockList: new RegExp(blockListPatterns.map((re) => re.source).join('|'))
  }
};

const finalConfig = mergeConfig(getDefaultConfig(__dirname), config);
// finalConfig.resolver.unstable_enablePackageExports = false;
// config.resolver.resolverMainFields = ['react-native', 'main', 'module'];

module.exports = withSentryConfig(finalConfig);
