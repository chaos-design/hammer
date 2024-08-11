#!/usr/bin/env node

require('tsm');

const argv = require('minimist')(process.argv.slice(2), {
  boolean: ['onlyDependencies'],
});

const cwd = argv.cwd || process.cwd();

console.log();
console.log('The command had running at \x1B[33m%s\x1B[0m:\n', cwd)
console.log('And the argv is', argv, argv._);

if (argv.filter) {
  if (argv.filter && !Array.isArray(argv.filter)) {
    argv.filter = [argv.filter];
  }
}

argv.tailCommands = argv._ || [];

Promise.resolve(require('.').pnpmPublish({ ...argv })).catch((err) => {
  console.error(err);
  process.exit(1);
});
