'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var child_process = require('child_process');
var fs = require('fs');
var path = require('path');

function _interopNamespace(e) {
  if (e && e.__esModule) return e;
  var n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () { return e[k]; }
        });
      }
    });
  }
  n.default = e;
  return Object.freeze(n);
}

var fs__namespace = /*#__PURE__*/_interopNamespace(fs);
var path__namespace = /*#__PURE__*/_interopNamespace(path);

// src/get-changed-files.ts
var getChangedFiles = (commitId = "HEAD^1") => {
  const changedFiles = child_process.execSync(`git diff ${commitId} --name-only`).toString().split("\n").filter(Boolean);
  return changedFiles;
};
var get_changed_files_default = getChangedFiles;
var getPackageInfo = (file) => {
  try {
    const packagePath = path__namespace.join(path__namespace.dirname(file), "package.json");
    if (!fs__namespace.existsSync(packagePath) || !fs__namespace.lstatSync(file).isFile()) {
      return null;
    }
    const packageJson = fs__namespace.readFileSync(packagePath, "utf-8");
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

exports.default = index_default;
exports.getChangedFiles = get_changed_files_default;
exports.getChangedPackages = get_changed_packages_default;
exports.getPackageInfo = get_package_default;
