const { declare } = require('@babel/helper-plugin-utils');

module.exports = declare((api) => {
  api.assertVersion(7);

  return {
    name: 'babel-plugin-jsx-source-location',
    visitor: {
      JSXOpeningElement(path, state) {
        const { node } = path;
        const { filename } = state.file.opts;

        // Skip if not in a file we care about (optional filter)
        if (!filename) return;

        // Calculate relative path for shorter output
        const cwd = state.cwd || process.cwd();
        const relativePath = filename.replace(cwd, '');
        const lineNumber = node.loc ? node.loc.start.line : 0;
        const columnNumber = node.loc ? node.loc.start.column : 0;

        const location = `${relativePath}:${lineNumber}:${columnNumber}`;

        // Add data-source-loc attribute
        node.attributes.push(
          api.types.jsxAttribute(
            api.types.jsxIdentifier('data-source-loc'),
            api.types.stringLiteral(location),
          ),
        );
      },
    },
  };
});
