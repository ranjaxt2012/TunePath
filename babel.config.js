// Inline Babel plugin: replaces `import.meta` with `undefined` so Metro
// can bundle @clerk/shared .mjs files that use `import.meta.env` as a
// Vite-style env fallback. The typeof guard in @clerk/shared means this
// is safe — `process.env` (the primary check) is always tried first.
function transformImportMeta() {
  return {
    visitor: {
      MetaProperty(path) {
        if (
          path.node.meta &&
          path.node.meta.name === 'import' &&
          path.node.property &&
          path.node.property.name === 'meta'
        ) {
          // import.meta → undefined
          // typeof undefined !== "undefined" evaluates to false,
          // so the import.meta.env branch is never reached at runtime.
          path.replaceWithSourceString('undefined');
        }
      },
    },
  };
}

module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [transformImportMeta],
  };
};
