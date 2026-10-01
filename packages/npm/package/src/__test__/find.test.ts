import path from 'node:path';
import { describe, expect, test } from 'vitest';
import { findPackages, getProjectDependencies } from '../find';
import { findPnpmConfig } from '../root-config';

const cwd = process.cwd();

/** Resolve the workspace config, failing loudly if it is missing. */
const workspace = async () => {
  const config = await findPnpmConfig(cwd);

  if (!config?.root) throw new Error('pnpm-workspace.yaml not found');

  return { root: config.root, patterns: config.packages };
};

describe('findPackages', () => {
  test('returns the workspace projects', async () => {
    const projects = await findPackages(cwd);

    expect(projects.length).toBeGreaterThan(0);
    expect(projects.map((p) => p.manifest.name)).toContain(
      '@chaos-design/package',
    );
  });
});

describe('getProjectDependencies', () => {
  test('returns every project when no rules are given', async () => {
    const { root, patterns } = await workspace();
    const result = await getProjectDependencies([], {
      rootPath: root,
      patterns,
    });

    expect(result.selectedProjects).toHaveLength(result.allProjects.length);
  });

  test('filters by dependency name', async () => {
    const { root, patterns } = await workspace();
    const result = await getProjectDependencies(['@chaos-design/task'], {
      rootPath: root,
      patterns,
    });

    expect(result.selectedProjects.map((p) => p.manifest.name)).toEqual([
      '@chaos-design/task',
    ]);
  });

  test('filters by glob on the workspace-relative directory', async () => {
    const { root, patterns } = await workspace();
    const result = await getProjectDependencies(['./packages/run/task'], {
      rootPath: root,
      patterns,
    });

    expect(result.selectedProjects.map((p) => p.manifest.name)).toEqual([
      '@chaos-design/task',
    ]);
  });

  test('glob rules support wildcards', async () => {
    const { root, patterns } = await workspace();
    const result = await getProjectDependencies(['./packages/shadcn-ui/*'], {
      rootPath: root,
      patterns,
    });

    expect(result.selectedProjects.map((p) => p.manifest.name).sort()).toEqual([
      '@chaos-design/calendar',
      '@chaos-design/color-picker',
      '@chaos-design/month-datepicker',
      '@chaos-design/shadcn-kits',
    ]);
  });

  test('expands the {dir} shorthand into a glob', async () => {
    const { root, patterns } = await workspace();
    const result = await getProjectDependencies(['{packages/npm/publish}'], {
      rootPath: root,
      patterns,
    });

    expect(result.selectedProjects.map((p) => p.manifest.name)).toEqual([
      '@chaos-design/publish',
    ]);
  });

  test('glob rules win over dependency-name rules', async () => {
    const { root, patterns } = await workspace();
    const result = await getProjectDependencies(
      ['./packages/run/task', '@chaos-design/calendar'],
      { rootPath: root, patterns },
    );

    expect(result.selectedProjects.map((p) => p.manifest.name)).toEqual([
      '@chaos-design/task',
    ]);
  });

  test('returns an empty selection when nothing matches', async () => {
    const { root, patterns } = await workspace();
    const result = await getProjectDependencies(['does-not-exist'], {
      rootPath: root,
      patterns,
    });

    expect(result.selectedProjects).toEqual([]);
    expect(result.allProjects.length).toBeGreaterThan(0);
  });

  test('returns empty arrays for a root without any project', async () => {
    // `src` holds only TypeScript sources, no `package.json`.
    const result = await getProjectDependencies([], {
      rootPath: path.join(cwd, 'src'),
    });

    expect(result.selectedProjects).toEqual([]);
    expect(result.allProjects).toEqual([]);
  });
});
