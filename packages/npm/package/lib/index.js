var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};

// src/find.ts
import { findPackages as rawFindPackage } from "@pnpm/fs.find-packages";
import micromatch from "micromatch";
var findPackages = (dir, opts) => rawFindPackage(dir, { ignore: ["**/node_modules/**"], ...opts });
async function getProjectDependencies(ignore, { rootPath, ...opts }) {
  const deps = await findPackages(rootPath, opts);
  if (!ignore?.length) {
    return {
      selectedProjects: deps,
      allProjects: deps
    };
  }
  const globRules = [];
  const dependenciesRules = [];
  ignore.forEach((f) => {
    if (f.startsWith("./")) {
      globRules.push(f.slice(2));
      return;
    }
    if (/^\{(.+)\}$/.test(f)) {
      globRules.push(RegExp.$1);
      return;
    }
    dependenciesRules.push(f);
  });
  if (globRules.length) {
    const dirMap = /* @__PURE__ */ new Map();
    deps.forEach((p) => {
      dirMap.set(p.rootDir, p);
    });
    const matched = micromatch(Array.from(dirMap.keys()), globRules);
    if (!matched) {
      return {
        selectedProjects: [],
        allProjects: deps
      };
    }
    return {
      selectedProjects: matched.map((m) => dirMap.get(m)),
      allProjects: deps
    };
  }
  if (dependenciesRules.length) {
    const nameMap = /* @__PURE__ */ new Map();
    deps.forEach((p) => {
      nameMap.set(p.manifest.name, p);
    });
    const matched = micromatch(Array.from(nameMap.keys()), dependenciesRules);
    if (!matched) {
      return {
        selectedProjects: [],
        allProjects: deps
      };
    }
    return {
      selectedProjects: matched.map((m) => nameMap.get(m)),
      allProjects: deps
    };
  }
  return {
    selectedProjects: deps,
    allProjects: deps
  };
}

// src/project-graph.ts
function isWorkspacePackageSpec(spec) {
  return /^workspace:(.+)$/.test(spec);
}
var ProjectsGraph = class {
  constructor(options) {
    this.options = options;
    __publicField(this, "projectMap");
    __publicField(this, "workspaceDependenciesMap");
    __publicField(this, "dependenciesMap");
    __publicField(this, "_walkTmp", /* @__PURE__ */ new Map());
    this.options = {
      ...options
    };
    this.options.depFields = this.options.depFields || [
      "dependencies",
      "devDependencies",
      "peerDependencies"
    ];
    this.projectMap = /* @__PURE__ */ new Map();
    this.workspaceDependenciesMap = /* @__PURE__ */ new Map();
    this.dependenciesMap = /* @__PURE__ */ new Map();
    this.options.projects.forEach((p) => {
      if (p.manifest.name) {
        this.projectMap.set(p.manifest.name, p);
      }
    });
  }
  getWorkspaceDependencies(name) {
    if (this.workspaceDependenciesMap.get(name)) {
      return this.workspaceDependenciesMap.get(name);
    }
    const proj = this.projectMap.get(name);
    if (!proj) {
      throw new Error(`${name} project is not found.`);
    }
    const depSet = /* @__PURE__ */ new Set();
    (this.options.depFields || []).forEach((f) => {
      const deps = proj.manifest[f] || {};
      Object.keys(deps).forEach((name2) => {
        if (isWorkspacePackageSpec(deps[name2])) {
          depSet.add(name2);
        }
      });
    });
    const res = Array.from(depSet);
    this.workspaceDependenciesMap.set(name, res);
    return res;
  }
  getDependencies(name) {
    if (this.dependenciesMap.get(name)) {
      return this.dependenciesMap.get(name);
    }
    if (this._walkTmp.get(name)) {
      return [];
    }
    this._walkTmp.set(name, true);
    const depNames = this.getWorkspaceDependencies(name);
    const nameSet = new Set(depNames);
    (depNames || []).forEach((n) => {
      if (name === n) {
        console.error(`${n} circle depend itself.`);
        return;
      }
      this.getDependencies(n).forEach((x) => {
        nameSet.add(x);
      });
    });
    const res = Array.from(nameSet);
    this.dependenciesMap.set(name, res);
    this._walkTmp.delete(name);
    return res;
  }
};

// src/root-config.ts
import * as fs from "fs";
import * as nps from "path";
import { findUp } from "find-up";
import readYamlFile from "read-yaml-file";
var readJsonFile = async (path) => {
  const text = await fs.promises.readFile(path, "utf-8");
  return JSON.stringify(text);
};
async function findPackageRoot(dir, { silent = false, name }) {
  if (name) {
    try {
      const fileName = await findUp(name, { type: "file", cwd: dir });
      if (!fileName) {
        return;
      }
      const dirName = nps.dirname(fileName);
      const baseName = nps.basename(fileName);
      return { fileName, baseName, root: dirName, packages: void 0 };
    } catch (error) {
      if (silent) {
        return;
      }
      throw new Error(error);
    }
  }
  if (silent) {
    return;
  }
  throw new Error("Not found packages config.");
}
async function findPackageRootConfig(dir, opts) {
  const data = await findPackageRoot(dir, opts);
  if (!data) {
    if (opts?.silent) {
      return;
    }
    throw new Error("Not found packages config.");
  }
  if (!opts.handlePackagesInfo) {
    if (opts?.silent) {
      return;
    }
    throw new Error("opts must have handlePackagesInfo");
  }
  return opts.handlePackagesInfo(data);
}
async function findPnpmConfig(dir, opts = {}) {
  return await findPackageRootConfig(dir, {
    name: "pnpm-workspace.yaml",
    // @ts-expect-error
    handlePackagesInfo: async (data) => {
      const { fileName, baseName, root } = data || {};
      return {
        packages: !fileName ? void 0 : (await readYamlFile(fileName)).packages,
        fileName,
        baseName,
        root
      };
    },
    ...opts
  });
}
async function findLernaConfig(dir, opts = {}) {
  return await findPackageRootConfig(dir, {
    name: "lerna.json",
    // @ts-expect-error
    handlePackagesInfo: async (data) => {
      const { fileName, baseName, root } = data || {};
      return {
        packages: !fileName ? void 0 : (await readJsonFile(fileName)).packages,
        fileName,
        baseName,
        root
      };
    },
    ...opts
  });
}
export {
  ProjectsGraph,
  findLernaConfig,
  findPackageRoot,
  findPackageRootConfig,
  findPackages,
  findPnpmConfig,
  getProjectDependencies,
  isWorkspacePackageSpec,
  readJsonFile
};
