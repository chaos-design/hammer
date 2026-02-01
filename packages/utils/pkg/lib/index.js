import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

// src/get-changed-files.ts
var getChangedFiles = (commitId = "HEAD^1") => {
  const changedFiles = execSync(`git diff ${commitId} --name-only`).toString().split("\n").filter(Boolean);
  return changedFiles;
};
var get_changed_files_default = getChangedFiles;
var getPackageInfo = (file) => {
  try {
    const packagePath = path.join(path.dirname(file), "package.json");
    if (!fs.existsSync(packagePath) || !fs.lstatSync(file).isFile()) {
      return null;
    }
    const packageJson = fs.readFileSync(packagePath, "utf-8");
    try {
      const packageJsonObj = JSON.parse(packageJson);
      return {
        name: packageJsonObj.name,
        version: packageJsonObj.version,
        path: packagePath
      };
    } catch (_error) {
      return null;
    }
  } catch (_error) {
    return null;
  }
};
var get_package_default = getPackageInfo;

// src/get-changed-packages.ts
var checkFiles = (files, ignorePath = []) => {
  const result = [];
  const ignorePaths = ignorePath.map((p) => new RegExp(p));
  files.filter((f) => !ignorePaths.some((r) => r.test(f))).forEach((file) => {
    const packageInfo = get_package_default(file);
    if (packageInfo) {
      result.push(packageInfo);
    }
  });
  return result;
};
var uniqueChangedPackages = (changedPackages) => {
  const unique = [];
  const packages = {};
  changedPackages.forEach((item) => {
    if (!packages[item.name]) {
      packages[item.name] = true;
      unique.push(item);
    }
  });
  return unique;
};
var getChangedPackages = (commitId = "HEAD^1", ignorePath = []) => {
  const changedFiles = get_changed_files_default(commitId);
  return uniqueChangedPackages(checkFiles(changedFiles, ignorePath) || []);
};
var get_changed_packages_default = getChangedPackages;

// src/index.ts
var index_default = {
  getPackageInfo: get_package_default,
  getChangedFiles: get_changed_files_default,
  getChangedPackages: get_changed_packages_default
};

export { index_default as default, get_changed_files_default as getChangedFiles, get_changed_packages_default as getChangedPackages, get_package_default as getPackageInfo };
