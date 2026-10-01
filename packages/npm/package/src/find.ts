import path from 'node:path';
import type { Options } from '@pnpm/fs.find-packages';
import { findPackages as rawFindPackage } from '@pnpm/fs.find-packages';

import micromatch from 'micromatch';

/**
 * A discovered workspace project.
 *
 * Declared structurally rather than derived from `@pnpm/fs.find-packages`: that
 * package's types carry branded path aliases which cannot be named in the
 * emitted `.d.ts` without dragging a private dependency into the public API.
 */
export interface Project {
  /** Absolute path to the package directory. */
  rootDir: string;
  /** The parsed `package.json`. */
  manifest: {
    name?: string;
    version?: string;
    [key: string]: unknown;
  };
}

/** Normalise a path to forward slashes so globs behave on every platform. */
const toPosix = (p: string) => p.split(path.sep).join('/');

export const findPackages = async (
  dir: string,
  opts?: Options,
): Promise<Project[]> =>
  (await rawFindPackage(dir, {
    ignore: ['**/node_modules/**'],
    ...opts,
  })) as unknown as Project[];

/**
 * `{example}` is shorthand for the glob `example`, matching the same syntax the
 * `ignore`/`filter` options already accept.
 */
const toGlob = (pattern: string) => {
  const brace = /^\{(.+)\}$/.exec(pattern);

  return brace ? brace[1] : pattern;
};

/**
 * Split the ignore rules into glob rules (matching a directory path) and
 * dependency-name rules (matching `package.json#name`).
 *
 * Anything starting with `./` or wrapped in `{}` is treated as a path glob,
 * everything else is treated as a package name.
 */
const splitRules = (rules: string[]) => {
  const globRules: string[] = [];
  const nameRules: string[] = [];

  for (const rule of rules) {
    if (rule.startsWith('./')) {
      globRules.push(rule.slice(2));
    } else if (/^\{.+\}$/.test(rule)) {
      globRules.push(toGlob(rule));
    } else {
      nameRules.push(rule);
    }
  }

  return { globRules, nameRules };
};

/**
 * Resolve `allProjects` down to `selectedProjects`.
 *
 * Glob rules take precedence over dependency-name rules, matching the
 * documented behaviour.
 */
export async function getProjectDependencies(
  ignore: string[],
  { rootPath, ...opts }: Options & { rootPath: string },
): Promise<{ selectedProjects: Project[]; allProjects: Project[] }> {
  const allProjects = await findPackages(rootPath, opts);

  if (!ignore?.length) {
    return { selectedProjects: allProjects, allProjects };
  }

  const { globRules, nameRules } = splitRules(ignore);

  if (globRules.length) {
    // Match globs against the workspace-relative directory, so a rule like
    // `./publish` resolves to `packages/npm/publish` rather than having to
    // spell out an absolute path.
    const relativeDir = (project: Project) =>
      toPosix(path.relative(rootPath, project.rootDir));

    return {
      selectedProjects: allProjects.filter((project) =>
        micromatch.isMatch(relativeDir(project), globRules),
      ),
      allProjects,
    };
  }

  if (nameRules.length) {
    const nameMap = new Map<string, Project>(
      allProjects.flatMap((p) =>
        p.manifest.name ? ([[p.manifest.name, p]] as const) : [],
      ),
    );
    const matched = micromatch([...nameMap.keys()], nameRules);

    return {
      selectedProjects: matched.flatMap((name) => {
        const project = nameMap.get(name);

        return project ? [project] : [];
      }),
      allProjects,
    };
  }

  return { selectedProjects: [], allProjects };
}
