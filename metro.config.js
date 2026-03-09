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

// Ensure content folder is watched and resolvable
config.watchFolders = [
  ...(config.watchFolders || []),
  path.resolve(__dirname, 'content'),
];

module.exports = config;
