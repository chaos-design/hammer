import * as cp from 'node:child_process';
import { createRequire } from 'node:module';
import {
  type FindPackageRootResult,
  findPackageRoot,
  findPnpmConfig,
  getProjectDependencies,
  ProjectsGraph,
} from '@chaos-design/package';

const require = createRequire(import.meta.url);

export interface PnpmPublishOptions {
  /** Package names or `name@version` specs to publish. */
  filter?: string[];
  /** Directory to resolve the workspace from. Defaults to `process.cwd()`. */
  cwd?: string;
  /** Extra globs/names to exclude when discovering projects. */
  ignore?: string[];
  /** Publish even when the resolved selection is empty. */
  force?: boolean;
  /** Appended verbatim to the `pnpm publish` argv. */
  tailCommands?: string[];
  /** Consider `peerDependencies` as publish blockers. Defaults to `true`. */
  onlyDependencies?: boolean;
  /** Print the command without running it. */
  dryRun?: boolean;
  /** Print the command before running it. Defaults to `true`. */
  log?: boolean;
}

const DEFAULT_IGNORE = [
  '**/node_modules/**',
  '**/.temp/**',
  '**/.gitignore',
  '**/.pnpm-store/**',
];

const readPackageName = async (cwd: string) => {
  const found: FindPackageRootResult | undefined = await findPackageRoot(cwd, {
    name: 'package.json',
    silent: true,
  });

  if (!found) {
    throw new Error(`No package.json found at or above ${cwd}.`);
  }

  const manifest = require(found.fileName) as { name?: string };

  if (!manifest.name) {
    throw new Error(`package.json at ${found.fileName} has no "name".`);
  }

  return manifest.name;
};

/**
 * Collect the given packages plus their transitive workspace dependencies.
 *
 * @returns package names in publish order, dependencies first.
 */
export async function resolvePublishPackages(
  filter: string[],
  options: {
    cwd: string;
    ignore: string[];
    onlyDependencies: boolean;
  },
): Promise<string[]> {
  const config = await findPnpmConfig(options.cwd);

  if (!config) {
    throw new Error(`No pnpm-workspace.yaml found at or above ${options.cwd}.`);
  }

  const { packages, root } = config;

  const { allProjects } = await getProjectDependencies(filter, {
    rootPath: root,
    patterns: packages,
    ignore: options.ignore,
  });

  const graph = new ProjectsGraph({
    depFields: options.onlyDependencies
      ? ['dependencies', 'peerDependencies']
      : ['dependencies', 'devDependencies', 'peerDependencies'],
    projects: allProjects,
  });

  const nameSet = new Set<string>();

  const collect = (name: string, visiting: Set<string>) => {
    if (visiting.has(name)) return;

    visiting.add(name);

    // Dependencies first, so the registry already has them.
    for (const dep of graph.getWorkspaceDependencies(name)) {
      collect(dep, visiting);
      nameSet.add(dep);
    }

    visiting.delete(name);
    nameSet.add(name);
  };

  for (const project of allProjects) {
    if (filter.includes(project.manifest.name as string)) {
      collect(project.manifest.name as string, new Set());
    }
  }

  return [...nameSet];
}

/**
 * Publish several workspace packages in one `pnpm publish` call.
 *
 * @returns the command that was run (or would be run for `dryRun`).
 */
export async function pnpmPublish({
  filter,
  cwd = process.cwd(),
  ignore = DEFAULT_IGNORE,
  force = false,
  tailCommands,
  onlyDependencies = true,
  dryRun = false,
  log = true,
}: PnpmPublishOptions = {}): Promise<string> {
  const names = filter?.length ? filter : [await readPackageName(cwd)];

  const publishOrder = await resolvePublishPackages(names, {
    cwd,
    ignore,
    onlyDependencies,
  });

  if (!publishOrder.length && !force) {
    throw new Error(
      'No packages matched the given filter. Pass --force to publish anyway.',
    );
  }

  // Build argv as an array: never interpolate user input into a shell string.
  const args = [
    'publish',
    ...publishOrder.map((name) => `--filter=${name}`),
    ...(tailCommands ?? []),
  ];

  const command = ['pnpm', ...args].join(' ');

  if (log) {
    console.log('Packages to publish:', publishOrder.join(', ') || '(none)');
    console.log('Command:', command);
  }

  if (dryRun) return command;

  cp.execFileSync('pnpm', args, { cwd, stdio: 'inherit' });

  return command;
}

export default pnpmPublish;
