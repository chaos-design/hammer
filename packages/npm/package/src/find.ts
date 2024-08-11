import type { Options } from '@pnpm/fs.find-packages';
import { findPackages as rawFindPackage } from '@pnpm/fs.find-packages';

import micromatch from 'micromatch';

export const findPackages = (dir: string, opts?: Options) =>
  rawFindPackage(dir, { ignore: ['**/node_modules/**'], ...opts });

export async function getProjectDependencies(
  ignore: string[],
  { rootPath, ...opts }: Options & { rootPath: string },
) {
  const deps = await findPackages(rootPath, opts);

  if (!ignore?.length) {
    return {
      selectedProjects: deps,
      allProjects: deps,
    };
  }

  const globRules: string[] = [];
  const dependenciesRules: string[] = [];

  ignore.forEach((f) => {
    // ./
    if (f.startsWith('./')) {
      globRules.push(f.slice(2));
      return;
    }

    // {example}
    // eslint-disable-next-line regexp/no-unused-capturing-group
    if (/^\{(.+)\}$/.test(f)) {
      // eslint-disable-next-line regexp/no-legacy-features
      globRules.push(RegExp.$1);
      return;
    }

    dependenciesRules.push(f);
  });

  if (globRules.length) {
    const dirMap = new Map();

    deps.forEach((p) => {
      dirMap.set(p.rootDir, p);
    });

    const matched = micromatch(Array.from(dirMap.keys()), globRules);

    if (!matched) {
      return {
        selectedProjects: [],
        allProjects: deps,
      };
    }

    return {
      selectedProjects: matched.map((m: any) => dirMap.get(m)),
      allProjects: deps,
    };
  }

  if (dependenciesRules.length) {
    const nameMap = new Map();

    deps.forEach((p) => {
      nameMap.set(p.manifest.name, p);
    });

    const matched = micromatch(Array.from(nameMap.keys()), dependenciesRules);

    if (!matched) {
      return {
        selectedProjects: [],
        allProjects: deps,
      };
    }
    return {
      selectedProjects: matched.map((m: any) => nameMap.get(m)),
      allProjects: deps,
    };
  }

  return {
    selectedProjects: deps,
    allProjects: deps,
  };
}
