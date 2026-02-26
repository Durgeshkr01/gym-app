const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// On web builds, replace native-only Expo modules with empty stubs
const nativeOnlyModules = [
  'expo-document-picker',
  'expo-file-system',
  'expo-sharing',
];

const originalResolver = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web' && nativeOnlyModules.some(m => moduleName === m || moduleName.startsWith(m + '/'))) {
    return { type: 'empty' };
  }
  if (originalResolver) {
    return originalResolver(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
