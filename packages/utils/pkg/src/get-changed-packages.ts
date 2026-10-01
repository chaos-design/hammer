import getChangedFiles from './get-changed-files';
import getPackageInfo from './get-package';
import type { PackageInfo } from './types';

/**
 * Map changed files to the packages that own them.
 *
 * @param files File paths, relative to the repository root.
 * @param ignorePath Patterns of paths to skip.
 */
export const checkFiles = (
  files: string[],
  ignorePath: (string | RegExp)[] = [],
): PackageInfo[] => {
  const ignorePatterns = ignorePath.map((p) =>
    p instanceof RegExp ? p : new RegExp(p),
  );

  const result: PackageInfo[] = [];

  for (const file of files) {
    if (ignorePatterns.some((pattern) => pattern.test(file))) continue;

    const packageInfo = getPackageInfo(file);

    if (packageInfo) result.push(packageInfo);
  }

  return result;
};

/** Keep the first entry for each package name, preserving order. */
export const uniqueChangedPackages = (
  changedPackages: PackageInfo[],
): PackageInfo[] => {
  const seen = new Set<string>();

  return changedPackages.filter((info) => {
    if (seen.has(info.name)) return false;

    seen.add(info.name);

    return true;
  });
};

/**
 * The packages touched by a commit, each listed once.
 *
 * @param commitId A commit-ish to diff against, e.g. `HEAD^1`.
 * @param ignorePath Patterns of paths to skip.
 */
const getChangedPackages = (
  commitId = 'HEAD^1',
  ignorePath: (string | RegExp)[] = [],
): PackageInfo[] =>
  uniqueChangedPackages(checkFiles(getChangedFiles(commitId), ignorePath));

export default getChangedPackages;
