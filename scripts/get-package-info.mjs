import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);

const IGNORED_DIRS = new Set([
  'node_modules',
  'dist',
  'out',
  '.git',
  'example',
]);

/** Recursively collect every workspace package under `dir`. */
const collect = (dir, found = []) => {
  let entries;

  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return found;
  }

  for (const entry of entries) {
    if (IGNORED_DIRS.has(entry.name) || entry.name.startsWith('.')) continue;

    const entryPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      collect(entryPath, found);
      continue;
    }

    if (entry.name !== 'package.json') continue;

    try {
      const pkg = JSON.parse(fs.readFileSync(entryPath, 'utf-8'));

      if (!pkg.name) continue;

      found.push({
        name: pkg.name,
        version: pkg.version,
        description: pkg.description,
        private: Boolean(pkg.private),
        dir: path.relative(rootDir, dir),
      });
    } catch {
      // A malformed manifest should not break the docs table.
    }
  }

  return found;
};

/** Read the workspace globs from `pnpm-workspace.yaml`, if present. */
const readWorkspaceGlobs = () => {
  const file = path.join(rootDir, 'pnpm-workspace.yaml');

  try {
    return fs
      .readFileSync(file, 'utf-8')
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.startsWith('- '))
      .map((line) => line.replace(/^- ['"]?/, '').replace(/['"]?,?$/, ''));
  } catch {
    return [];
  }
};

const main = () => {
  const packagesDir = path.join(rootDir, 'packages');

  // De-duplicate by name: two directories may declare the same package name.
  const byName = new Map();
  for (const pkg of collect(packagesDir)) {
    const existing = byName.get(pkg.name);

    // Prefer a publishable package over a private one of the same name.
    if (!existing || (existing.private && !pkg.private)) {
      byName.set(pkg.name, pkg);
    }
  }

  const packages = [...byName.values()].sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  const globs = readWorkspaceGlobs();

  let markdown = '# 包版本信息\n\n';
  markdown += `共 ${packages.length} 个包，其中 ${packages.length - packages.filter((p) => p.private).length} 个可发布。\n\n`;
  markdown += '| Package Name | Version | Private | Description |\n';
  markdown += '| --- | --- | --- | --- |\n';

  for (const pkg of packages) {
    const name = pkg.private ? `${pkg.name} (${pkg.dir})` : pkg.name;
    const version = pkg.version ?? 'unknown';
    const description = (pkg.description ?? '').replace(/\|/g, '\\|');

    markdown += `| \`${name}\` | ${version} | ${pkg.private ? 'yes' : 'no'} | ${description} |\n`;
  }

  if (globs.length) {
    markdown += '\n## Workspace globs\n\n';
    markdown += '```yaml\npackages:\n';
    for (const glob of globs) markdown += `  - '${glob}'\n`;
    markdown += '```\n';
  }

  fs.writeFileSync(path.join(rootDir, 'packages.md'), markdown, 'utf-8');

  console.log(`Wrote ${packages.length} packages to packages.md`);
};

main();
