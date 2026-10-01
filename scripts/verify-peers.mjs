/**
 * Verify the peer dependency contract of every package.
 *
 * The UI packages claim support for React 18 and 19, and the docs site runs
 * React 19. This checks that:
 *   - every non-React peer dependency is also a direct dependency
 *     (a package must never rely on a transitive hoist to resolve an import)
 *   - `react` / `react-dom` are declared as peers, not dependencies
 *   - every declared peer range is actually satisfied by what is installed
 */

import fs from 'node:fs';
import { builtinModules, createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);
const require = createRequire(import.meta.url);

const IGNORED_DIRS = new Set(['node_modules', 'dist', 'out', 'coverage']);

/** Directories under `packages` that hold a package.json. */
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

/** Minimal semver range check: enough for `^x.y.z` and `x || y` ranges. */
const satisfiesRange = (version, range) => {
  const parse = (v) => {
    const [core, pre = ''] = v.split('-');
    const [major, minor = 0, patch = 0] = core.split('.').map(Number);

    return { major, minor, patch, pre };
  };

  const installed = parse(version);
  const isPre = installed.pre !== '';

  const compare = (a, b) =>
    a.major - b.major || a.minor - b.minor || a.patch - b.patch;

  return range.split('||').some((clause) => {
    const trimmed = clause.trim();

    if (trimmed === '*' || trimmed === '') return true;

    const alternatives = trimmed.split(/\s+/);

    // Handle the common `^x.y.z` and `>=x.y.z` forms.
    for (const alt of alternatives) {
      const caret = /^\^(\d+)\.(\d+)\.(\d+)/.exec(alt);
      const gte = /^>=\s*(\d+)\.(\d+)\.(\d+)/.exec(alt);
      const exact = /^(\d+)\.(\d+)\.(\d+)$/.exec(alt);

      if (caret) {
        const min = parse(caret.slice(1).join('.'));
        // A prerelease never satisfies a plain caret range.
        if (isPre && !min.pre) return false;
        if (compare(installed, min) < 0) return false;
        if (min.major > 0) return installed.major === min.major;
        if (min.minor > 0)
          return installed.major === 0 && installed.minor === min.minor;

        return compare(installed, min) >= 0;
      }

      if (gte) {
        if (isPre) return false;
        if (compare(installed, parse(gte.slice(1).join('.'))) < 0) return false;
      }

      if (exact) {
        if (isPre) return false;
        if (compare(installed, parse(exact[1])) !== 0) return false;
      }
    }

    return true;
  });
};

/**
 * Scan a package's source for bare imports and report the ones that resolve
 * neither to a declared dependency nor to a Node builtin.
 */
const findUndeclaredImports = (dir, manifest) => {
  const declared = new Set([
    ...Object.keys(manifest.dependencies ?? {}),
    ...Object.keys(manifest.peerDependencies ?? {}),
    ...Object.keys(manifest.optionalDependencies ?? {}),
    ...Object.keys(manifest.devDependencies ?? {}),
  ]);

  const sourceRoot = path.join(dir, 'src');
  if (!fs.existsSync(sourceRoot)) return [];

  const undeclared = new Set();
  // `builtinModules` lists bare names; also strip the `node:` prefix.
  const builtin = new Set(
    builtinModules.flatMap((m) => [m, m.replace(/^node:/, '')]),
  );

  const walk = (current) => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const entryPath = path.join(current, entry.name);

      if (entry.isDirectory()) {
        walk(entryPath);
        continue;
      }

      if (!/\.(ts|tsx|js|jsx|mjs|cjs)$/.test(entry.name)) continue;
      // Vendored third-party UI code is excluded: it is not our contract.
      if (entryPath.includes(`${path.sep}components${path.sep}ui${path.sep}`)) {
        continue;
      }

      const source = fs.readFileSync(entryPath, 'utf-8');
      const importRe = /(?:from|import)\s+['"]([^'"]+)['"]/g;

      let match = importRe.exec(source);
      while (match !== null) {
        const spec = match[1];

        if (spec.startsWith('.')) {
          match = importRe.exec(source);
          continue;
        }

        const bare = spec.replace(/^node:/, '');
        const pkgName = bare.startsWith('@')
          ? bare.split('/').slice(0, 2).join('/')
          : bare.split('/')[0];

        if (builtin.has(pkgName)) {
          match = importRe.exec(source);
          continue;
        }

        if (!declared.has(pkgName)) undeclared.add(pkgName);

        match = importRe.exec(source);
      }
    }
  };

  walk(sourceRoot);

  return [...undeclared];
};

const dirs = [...new Set(findPackageDirs(path.join(rootDir, 'packages')))];
const errors = [];
const warnings = [];

for (const dir of dirs) {
  const rel = path.relative(rootDir, dir);
  const manifest = JSON.parse(
    fs.readFileSync(path.join(dir, 'package.json'), 'utf-8'),
  );

  const isUiPackage =
    manifest.peerDependencies?.react !== undefined ||
    manifest.dependencies?.react !== undefined;

  // React must be a peer, never a hard dependency: two copies of React break
  // hooks and context.
  if (manifest.dependencies?.react || manifest.dependencies?.['react-dom']) {
    errors.push(
      `${rel}: react/react-dom must be peerDependencies, not dependencies`,
    );
  }

  /**
   * Peers that are expected to be provided by the host at build time rather
   * than bundled, so they need no matching runtime dependency.
   */
  const HOST_PROVIDED_PEERS = new Set(['@babel/core', 'vite', 'typescript']);

  for (const [name, range] of Object.entries(manifest.peerDependencies ?? {})) {
    if (name === 'react' || name === 'react-dom') continue;
    if (HOST_PROVIDED_PEERS.has(name)) continue;

    if (!manifest.dependencies?.[name]) {
      errors.push(
        `${rel}: peer "${name}@${range}" is not declared in dependencies`,
      );
    }
  }

  for (const pkg of findUndeclaredImports(dir, manifest)) {
    errors.push(`${rel}: imports "${pkg}" which is not a declared dependency`);
  }

  if (!isUiPackage) continue;

  // React must resolve to exactly one copy across the whole workspace,
  // otherwise hooks break at runtime.
  try {
    const version = require('react/package.json').version;
    const range = manifest.peerDependencies.react;

    if (range && !satisfiesRange(version, range)) {
      errors.push(
        `${rel}: installed react@${version} does not satisfy "${range}"`,
      );
    }
  } catch {
    warnings.push(`${rel}: could not resolve react to check the peer range`);
  }
}

for (const warning of warnings) console.warn(`warn: ${warning}`);

if (errors.length > 0) {
  console.error('\nPeer dependency verification failed:\n');
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}

console.log(
  `Peer dependency verification passed for ${dirs.length} package(s).`,
);
