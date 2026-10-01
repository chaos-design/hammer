import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Fail the build when a package cannot be published as-is.
 *
 * Checks, for every non-private workspace package:
 *   - the package name is unique across the workspace
 *   - `files` covers every entry point, so npm actually ships them
 *   - `version` is set
 *   - a licence and repository are declared
 *   - `workspace:` dependencies have a matching version at publish time
 */

const rootDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);

const IGNORED_DIRS = new Set([
  'node_modules',
  'dist',
  'lib',
  'out',
  'coverage',
]);

/** Collect every directory under `dir` holding a package.json. */
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

/** Every file path referenced by `main`/`module`/`types`/`bin`/`exports`. */
const entryPointsOf = (manifest) => {
  const refs = [];

  const visit = (node) => {
    if (typeof node === 'string') {
      refs.push(node);
      return;
    }

    if (node && typeof node === 'object') {
      for (const value of Object.values(node)) visit(value);
    }
  };

  visit(manifest.main);
  visit(manifest.module);
  visit(manifest.types);
  visit(manifest.exports);
  visit(manifest.bin);

  return [...new Set(refs)].filter((ref) => ref.startsWith('.'));
};

/**
 * Whether npm's `files` would include `target`.
 *
 * npm matches `files` entries against the path relative to the package root
 * using gitignore-like rules: a bare directory name covers the directory *and
 * everything under it*, a trailing `/` marks a directory, and `*` is a
 * single-segment wildcard. `package.json` is always published regardless.
 */
const filesCovers = (files, target) => {
  const rel = target.replace(/^\.\//, '');

  if (rel === 'package.json') return true;

  if (!files || files.length === 0) return true; // npm publishes everything

  return files.some((pattern) => {
    const clean = pattern.replace(/^\.\//, '').replace(/\/$/, '');

    if (clean.includes('*')) {
      const segments = clean.split('/');
      const parts = rel.split('/');

      // Match segment counts from the right, as gitignore does for anchored paths.
      if (segments.length > parts.length) return false;

      const offset = parts.length - segments.length;

      return segments.every((segment, i) => {
        if (!segment.includes('*')) return segment === parts[offset + i];

        const re = new RegExp(
          `^${segment
            .split('*')
            .map((p) => p.replace(/[.+?^${}()|[\]\\]/g, '\\$&'))
            .join('[^/]*')}$`,
        );

        return re.test(parts[offset + i]);
      });
    }

    return rel === clean || rel.startsWith(`${clean}/`);
  });
};

const dirs = [...new Set(findPackageDirs(path.join(rootDir, 'packages')))].map(
  (dir) => ({ dir, manifest: readManifest(dir) }),
);

const publishable = dirs.filter(({ manifest }) => !manifest.private);
const byName = new Map();

const errors = [];
const warnings = [];

for (const { dir, manifest } of dirs) {
  const rel = path.relative(rootDir, dir);

  if (!manifest.version) {
    errors.push(`${rel}: missing "version"`);
  }

  if (!manifest.license) {
    warnings.push(`${rel}: missing "license"`);
  }

  if (!manifest.repository) {
    warnings.push(`${rel}: missing "repository"`);
  }

  if (manifest.private) continue;

  const previous = byName.get(manifest.name);
  if (previous) {
    errors.push(
      `duplicate package name "${manifest.name}": ${path.relative(rootDir, previous)} and ${rel}`,
    );
  } else {
    byName.set(manifest.name, dir);
  }

  if (manifest.publishConfig?.access !== 'public') {
    warnings.push(
      `${rel}: publishConfig.access is not "public", scoped packages may fail to publish`,
    );
  }

  for (const entry of entryPointsOf(manifest)) {
    if (!filesCovers(manifest.files, entry)) {
      errors.push(`${rel}: "files" does not include entry point ${entry}`);
    }
  }
}

// A `workspace:` dependency must exist and declare a version, otherwise pnpm
// rewrites it to `workspace:*` at publish time and the registry rejects it.
for (const { dir, manifest } of publishable) {
  const rel = path.relative(rootDir, dir);

  const deps = {
    ...(manifest.dependencies ?? {}),
    ...(manifest.peerDependencies ?? {}),
    ...(manifest.optionalDependencies ?? {}),
  };

  for (const [name, spec] of Object.entries(deps)) {
    if (!String(spec).startsWith('workspace:')) continue;

    const target = byName.get(name);

    if (!target) {
      errors.push(
        `${rel}: workspace dependency "${name}" is not a package here`,
      );
      continue;
    }

    const targetManifest = readManifest(target);

    if (!targetManifest.version) {
      errors.push(
        `${rel}: workspace dependency "${name}" has no version to publish`,
      );
    }
  }
}

for (const warning of warnings) console.warn(`warn: ${warning}`);

if (errors.length > 0) {
  console.error('\nPublish verification failed:\n');
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}

console.log(
  `Publish verification passed for ${publishable.length} package(s).`,
);
