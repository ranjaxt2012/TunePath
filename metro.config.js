const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ensure video formats including .mov/.MOV are bundled
const videoExts = ['mov', 'MOV', 'mp4', 'm4v'];
videoExts.forEach((ext) => {
  if (!config.resolver.assetExts.includes(ext)) {
    config.resolver.assetExts.push(ext);
  }
});

// Allow Metro to transform .mjs files (e.g. @clerk/shared uses import.meta in .mjs)
config.resolver.sourceExts = [
  ...config.resolver.sourceExts,
  'mjs',
];

config.transformer = {
  ...config.transformer,
  unstable_allowRequireContext: true,
};

// Ensure content folder is watched and resolvable
config.watchFolders = [
  ...(config.watchFolders || []),
  path.resolve(__dirname, 'content'),
];

module.exports = config;
