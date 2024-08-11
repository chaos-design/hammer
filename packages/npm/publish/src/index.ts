/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import * as cp from 'node:child_process';
import {
  ProjectsGraph,
  findPnpmConfig,
  getProjectDependencies,
} from '@chaos-design/package';
import { findUp } from 'find-up';

export async function pnpmPublish({
  filter,
  cwd = process.cwd(),
  force,
  tailCommands,
  onlyDependencies,
  ignore = [
    '**/node_modules/**',
    '**/.temp/**',
    '**/.gitignore',
    '**/.pnpm-store/**',
  ],
}: {
  filter?: string[];
  cwd?: string;
  ignore?: string[];
  force?: boolean;
  tailCommands?: string[];
  onlyDependencies?: boolean;
}) {
  if (!filter?.length) {
    const pkgFile = await findUp('package.json', { type: 'file', cwd });
    // @ts-expect-error
    filter = [require(pkgFile).name];
  }

  // @ts-expect-error
  const { packages, root } = await findPnpmConfig(cwd);

  const filtered = await getProjectDependencies(filter, {
    rootPath: root,
    patterns: packages,
    ignore,
  });
  const graph = new ProjectsGraph({
    depFields: !onlyDependencies
      ? ['dependencies']
      : ['dependencies', 'peerDependencies'],
    projects: filtered.allProjects,
  });

  const getWorkspaceDependencies = (
    name: string,
    nameSet = new Set(),
    track = new Set(),
  ) => {
    if (track.has(name)) {
      return nameSet;
    }

    track.add(name);

    // @ts-expect-error
    graph.getWorkspaceDependencies(name).forEach((name) => {
      getWorkspaceDependencies(name, nameSet, track);
      nameSet.add(name);
    });

    track.delete(name);
    nameSet.add(name);

    return nameSet;
  };

  const nameSet = new Set();

  const _trace = new Set();

  filtered.selectedProjects.forEach((x) => {
    getWorkspaceDependencies(x.manifest.name, nameSet, _trace);
  });

  console.log('What the packages which need publish:', Array.from(nameSet));
  if (!nameSet.size && !force) {
    throw new Error('指定包为空，请设置 --force');
  }

  return cp.exec(
    // `pnpm publish ${Array.from(nameSet)
    `echo "${Array.from(nameSet)
        .map((name: any) => `--filter=${JSON.stringify(name)}`)
        .join(' ')} ${tailCommands?.join(' ')}"`,
    {
      encoding: 'utf8',
    },
    (error, stdout, stderr) => {
      if (error) {
        throw error;
      }

      console.log(stdout);
      console.error(stderr);
    },
  );
}
