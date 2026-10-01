const path = require('node:path');
const { declare } = require('@babel/helper-plugin-utils');

module.exports = declare((api) => {
  api.assertVersion(7);

  return {
    name: 'babel-plugin-jsx-source-location',
    visitor: {
      JSXOpeningElement(nodePath, state) {
        const { node } = nodePath;
        const filename = state.file.opts.filename;

        if (!filename) return;

        const options = state.opts || {};
        const attributeName = options.attributeName || 'data-source-loc';

        // `path.relative` keeps only the leading cwd occurrence and drops the
        // trailing separator, which a plain string replace cannot guarantee.
        const cwd = state.cwd || process.cwd();
        const relativePath = path.isAbsolute(filename)
          ? path.relative(cwd, filename)
          : filename;

        // Falling outside `cwd` means "../.."; fall back to the full path so
        // the location stays unambiguous.
        const displayPath = relativePath.startsWith('..')
          ? filename
          : relativePath;

        const line = node.loc ? node.loc.start.line : 0;
        const column = node.loc ? node.loc.start.column : 0;

        const location = `${displayPath}:${line}:${column}`;

        const existing = node.attributes.find(
          (attr) =>
            api.types.isJSXAttribute(attr) &&
            api.types.isJSXIdentifier(attr.name, { name: attributeName }),
        );

        if (existing) {
          existing.value = api.types.stringLiteral(location);
        } else {
          node.attributes.push(
            api.types.jsxAttribute(
              api.types.jsxIdentifier(attributeName),
              api.types.stringLiteral(location),
            ),
          );
        }
      },
    },
  };
});
