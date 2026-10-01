import * as fs from 'node:fs';
import * as path from 'node:path';
import type { PackageInfo } from './types';

/**
 * Find the `package.json` that owns `file`.
 *
 * The search starts at the file's own directory and walks up to the filesystem
 * root, so `packages/a/src/x.ts` resolves to `packages/a/package.json` rather
 * than requiring the caller to pass the manifest path itself.
 *
 * @returns the directory containing the nearest `package.json`.
 */
const findPackageDir = (startDir: string): string | null => {
  let dir = path.resolve(startDir);

  for (;;) {
    if (fs.existsSync(path.join(dir, 'package.json'))) return dir;

    const parent = path.dirname(dir);

    if (parent === dir) return null;

    dir = parent;
  }
};

/**
 * Find the package that owns `file`.
 *
 * @returns the package info, or `null` when the file does not exist, has no
 *          owning `package.json`, or the manifest is missing a `name`/`version`.
 */
const getPackageInfo = (file: string): PackageInfo | null => {
  try {
    if (!fs.statSync(file).isFile()) return null;

    const dir = findPackageDir(path.dirname(file));

    if (!dir) return null;

    const packagePath = path.join(dir, 'package.json');
    const manifest = JSON.parse(
      fs.readFileSync(packagePath, 'utf-8'),
    ) as Partial<PackageInfo>;

    if (!manifest.name || !manifest.version) return null;

    return {
      name: manifest.name,
      version: manifest.version,
      path: packagePath,
    };
  } catch {
    return null;
  }
};

export default getPackageInfo;
