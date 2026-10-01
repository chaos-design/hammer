#!/usr/bin/env node
import { pnpmPublish } from './dist/index.js';

const argv = process.argv.slice(2);

const options = {
  dryRun: false,
  onlyDependencies: true,
  force: false,
  log: true,
  tailCommands: [],
  filter: [],
};

for (let i = 0; i < argv.length; i++) {
  const arg = argv[i];

  switch (arg) {
    case '--filter':
    case '-f':
      options.filter.push(argv[++i]);
      break;
    case '--cwd':
      options.cwd = argv[++i];
      break;
    case '--tail-command':
      options.tailCommands.push(argv[++i]);
      break;
    case '--dry-run':
      options.dryRun = true;
      break;
    case '--force':
      options.force = true;
      break;
    case '--all-deps':
      options.onlyDependencies = false;
      break;
    case '--quiet':
      options.log = false;
      break;
    default:
      // Everything after `--` is passed through to `pnpm publish`.
      if (arg === '--') {
        options.tailCommands.push(...argv.slice(i + 1));
        i = argv.length;
        break;
      }

      // Positional args are package filters, unless they look like a pnpm flag.
      if (!arg.startsWith('-')) {
        options.filter.push(arg);
      } else {
        options.tailCommands.push(arg);
      }
  }
}

const cwd = options.cwd || process.cwd();

console.log(`\nRunning in \x1b[33m%s\x1b[0m\n`, cwd);

try {
  const command = await pnpmPublish(options);

  if (options.dryRun) {
    console.log(`\nDry run, not executed:\n${command}`);
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
