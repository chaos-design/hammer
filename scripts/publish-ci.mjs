import { execFileSync } from 'node:child_process';
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
  'lib',
  'coverage',
  'out',
]);

/** Find every directory under `packages` that holds a package.json. */
const findPackageDirs = (dir, found = []) => {
  let entries;

  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return found;
  }

  for (const entry of entries) {
    if (IGNORED_DIRS.has(entry.name) || entry.name.startsWith('.')) continue;

    const entryPath = path.join(dir, entry.name);

    if (entry.isDirectory()) findPackageDirs(entryPath, found);
    else if (entry.name === 'package.json') found.push(dir);
  }

  return found;
};

const readManifest = (dir) =>
  JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf-8'));

/** Names of the workspace packages a package depends on via `workspace:`. */
const workspaceDeps = (manifest) => {
  const deps = {
    ...(manifest.dependencies ?? {}),
    ...(manifest.peerDependencies ?? {}),
    ...(manifest.optionalDependencies ?? {}),
  };

  return Object.entries(deps)
    .filter(([, spec]) => String(spec).startsWith('workspace:'))
    .map(([name]) => name);
};

/**
 * Order packages so a dependency always comes before its dependents.
 *
 * pnpm resolves `workspace:` specs against the registry at publish time, so
 * publishing a dependent first fails when the dependency version is new.
 */
const sortTopologically = (packages) => {
  const byName = new Map(packages.map((p) => [p.manifest.name, p]));
  const visited = new Set();
  const visiting = new Set();
  const ordered = [];

  const visit = (pkg) => {
    if (visited.has(pkg.manifest.name)) return;

    if (visiting.has(pkg.manifest.name)) {
      // A cycle cannot be published in dependency order; break it and continue.
      console.warn(
        `  ! dependency cycle involving ${pkg.manifest.name}, continuing.`,
      );
      return;
    }

    visiting.add(pkg.manifest.name);

    for (const dep of workspaceDeps(pkg.manifest)) {
      const target = byName.get(dep);

      if (target) visit(target);
    }

    visiting.delete(pkg.manifest.name);
    visited.add(pkg.manifest.name);
    ordered.push(pkg);
  };

  for (const pkg of packages) visit(pkg);

  return ordered;
};

/** Fail loudly when a package points at entry files that were never built. */
const verifyEntryPoints = (dir, manifest) => {
  const missing = [];

  const check = (relative) => {
    if (!relative || typeof relative !== 'string') return;

    const resolved = relative.startsWith('./')
      ? path.join(dir, relative.slice(2))
      : path.join(dir, relative);

    if (!fs.existsSync(resolved)) missing.push(relative);
  };

  check(manifest.main);
  check(manifest.module);
  check(manifest.types);

  if (typeof manifest.exports === 'string') {
    check(manifest.exports);
  } else if (manifest.exports && typeof manifest.exports === 'object') {
    const visit = (node) => {
      if (typeof node === 'string') return check(node);

      if (node && typeof node === 'object') {
        for (const value of Object.values(node)) visit(value);
      }
    };

    visit(manifest.exports);
  }

  return [...new Set(missing)];
};

const isPublished = (name, version) => {
  try {
    const out = execFileSync('npm', ['view', `${name}@${version}`, 'version'], {
      stdio: ['ignore', 'pipe', 'ignore'],
      encoding: 'utf-8',
    }).trim();

    return out === version;
  } catch {
    // 404 or a network failure both mean "treat as not published".
    return false;
  }
};

const publishDirs = process.argv.slice(2).filter((a) => !a.startsWith('-'));
const dryRun = process.argv.includes('--dry-run');
const expectVersion = process.argv
  .find((arg) => arg.startsWith('--expect-version='))
  ?.slice('--expect-version='.length);

const allDirs = [...new Set(findPackageDirs(path.join(rootDir, 'packages')))]
  .map((dir) => ({ dir, manifest: readManifest(dir) }))
  .filter(({ manifest }) => !manifest.private)
  .filter(
    ({ dir, manifest }) =>
      publishDirs.length === 0 ||
      publishDirs.some(
        (target) => manifest.name === target || dir.endsWith(target),
      ),
  );

console.log(`Found ${allDirs.length} publishable packages.`);

const ordered = sortTopologically(allDirs);

// Every package already on the registry is skipped below, and skipping is not an
// error. A release tagged `v0.2.0` before the versions were bumped therefore
// published nothing while still exiting 0 — a green run for a release that never
// happened. `bump-version` only bumps the packages that changed, so the invariant
// is "at least one package carries the tag's version", not "all of them do".
if (
  expectVersion &&
  !ordered.some(({ manifest }) => manifest.version === expectVersion)
) {
  const found = [
    ...new Set(ordered.map(({ manifest }) => manifest.version)),
  ].join(', ');
  console.error(
    `✗ no package is at version ${expectVersion}; the release would publish nothing.`,
  );
  console.error(`  Versions on this checkout: ${found || '(none)'}`);
  console.error(
    `  Run \`pnpm run bump-version\` and push the resulting commit before tagging.`,
  );
  process.exit(1);
}

let failures = 0;

for (const { dir, manifest } of ordered) {
  const { name, version } = manifest;

  const missing = verifyEntryPoints(dir, manifest);
  if (missing.length) {
    console.error(`✗ ${name}: entry points not built: ${missing.join(', ')}`);
    console.error(`  Run \`pnpm build\` first.`);
    failures += 1;
    continue;
  }

  if (isPublished(name, version)) {
    console.log(`- ${name}@${version} already published, skipping.`);
    continue;
  }

  if (dryRun) {
    console.log(`→ ${name}@${version} would be published`);
    continue;
  }

  console.log(`→ publishing ${name}@${version}`);

  try {
    execFileSync('pnpm', ['publish', '--access', 'public', '--no-git-checks'], {
      cwd: dir,
      stdio: 'inherit',
    });
    console.log(`✓ ${name}@${version}`);
  } catch (error) {
    console.error(`✗ failed to publish ${name}@${version}`);
    console.error(error instanceof Error ? error.message : error);
    failures += 1;
  }
}

if (failures > 0) {
  console.error(`\n${failures} package(s) failed.`);
  process.exit(1);
}
