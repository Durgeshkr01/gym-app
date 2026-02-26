const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Physical stub file for native-only modules on web builds
const EMPTY_MODULE = path.resolve(__dirname, 'src/utils/emptyNativeModule.js');

// These packages are native-only and cannot be bundled for web
const nativeOnlyModules = [
  'expo-document-picker',
  'expo-file-system',
  'expo-sharing',
];

const originalResolver = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (
    platform === 'web' &&
    nativeOnlyModules.some(m => moduleName === m || moduleName.startsWith(m + '/'))
  ) {
    return { type: 'sourceFile', filePath: EMPTY_MODULE };
  }
  if (originalResolver) {
    return originalResolver(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
