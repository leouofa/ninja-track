const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add any custom Metro configuration here if needed
config.resolver.assetExts.push('svg');

module.exports = config;