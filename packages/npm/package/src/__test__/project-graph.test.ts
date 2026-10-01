import { describe, expect, test } from 'vitest';
import { getProjectDependencies } from '../find';
import { isWorkspacePackageSpec, ProjectsGraph } from '../project-graph';
import { findPnpmConfig } from '../root-config';

const cwd = process.cwd();

/** Resolve the workspace config, failing loudly if it is missing. */
const workspace = async () => {
  const config = await findPnpmConfig(cwd);

  if (!config?.root) throw new Error('pnpm-workspace.yaml not found');

  return { root: config.root, patterns: config.packages };
};

const loadProjects = async () => {
  const { root, patterns } = await workspace();
  const { allProjects } = await getProjectDependencies([], {
    rootPath: root,
    patterns,
  });

  return allProjects;
};

describe('isWorkspacePackageSpec', () => {
  test('matches the workspace: protocol', () => {
    expect(isWorkspacePackageSpec('workspace:*')).toBe(true);
    expect(isWorkspacePackageSpec('workspace:^')).toBe(true);
    expect(isWorkspacePackageSpec('workspace:1.0.0')).toBe(true);
  });

  test('rejects everything else', () => {
    expect(isWorkspacePackageSpec('1.0.0')).toBe(false);
    expect(isWorkspacePackageSpec('^1.0.0')).toBe(false);
    expect(isWorkspacePackageSpec('')).toBe(false);
  });
});

describe('ProjectsGraph', () => {
  test('resolves transitive workspace dependencies', async () => {
    const graph = new ProjectsGraph({ projects: await loadProjects() });

    expect(graph.getWorkspaceDependencies('@chaos-design/calendar')).toEqual(
      expect.arrayContaining([
        '@chaos-design/shadcn-kits',
        '@chaos-design/color-picker',
        '@chaos-design/month-datepicker',
      ]),
    );

    expect(graph.getDependencies('@chaos-design/calendar')).toContain(
      '@chaos-design/shadcn-kits',
    );
  });

  test('caches results between calls', async () => {
    const graph = new ProjectsGraph({ projects: await loadProjects() });

    expect(graph.getDependencies('@chaos-design/package')).toEqual(
      graph.getDependencies('@chaos-design/package'),
    );
  });

  test('throws for an unknown project', async () => {
    const graph = new ProjectsGraph({ projects: await loadProjects() });

    expect(() => graph.getWorkspaceDependencies('nope')).toThrow(
      'nope project is not found.',
    );
  });

  test('ignores self-referencing dependencies', () => {
    const graph = new ProjectsGraph({
      projects: [
        {
          rootDir: '/a',
          manifest: {
            name: 'a',
            version: '1.0.0',
            dependencies: { a: 'workspace:*' },
          },
        },
      ] as never,
    });

    expect(graph.getDependencies('a')).toEqual([]);
  });

  test('survives a dependency cycle', () => {
    const graph = new ProjectsGraph({
      projects: [
        {
          rootDir: '/a',
          manifest: {
            name: 'a',
            version: '1.0.0',
            dependencies: { b: 'workspace:*' },
          },
        },
        {
          rootDir: '/b',
          manifest: {
            name: 'b',
            version: '1.0.0',
            dependencies: { a: 'workspace:*' },
          },
        },
      ] as never,
    });

    expect(graph.getDependencies('a')).toContain('b');
    expect(graph.getDependencies('b')).toContain('a');
  });
});
