import getChangedFiles from './get-changed-files';
import getPackageInfo from './get-package';
import type { PackageInfo } from './types';

export const checkFiles = (
  files: string[],
  ignorePath: (string | RegExp)[] = [],
): PackageInfo[] => {
  const result: PackageInfo[] = [];

  const ignorePaths = ignorePath.map((p: string | RegExp) => new RegExp(p));

  files
    .filter((f: string) => !ignorePaths.some((r) => r.test(f)))
    .forEach((file: string) => {
      const packageInfo: PackageInfo | null = getPackageInfo(file);

      if (packageInfo) {
        result.push(packageInfo);
      }
    });

  return result;
};

export const uniqueChangedPackages = (
  changedPackages: PackageInfo[],
): PackageInfo[] => {
  const unique: PackageInfo[] = [];
  const packages: { [name: string]: true } = {};

  changedPackages.forEach((item: PackageInfo) => {
    if (!packages[item.name]) {
      packages[item.name] = true;
      unique.push(item);
    }
  });

  return unique;
};

const getChangedPackages = (
  commitId = 'HEAD^1',
  ignorePath: (string | RegExp)[] = [],
) => {
  const changedFiles = getChangedFiles(commitId);

  return uniqueChangedPackages(checkFiles(changedFiles, ignorePath) || []);
};

export default getChangedPackages;
