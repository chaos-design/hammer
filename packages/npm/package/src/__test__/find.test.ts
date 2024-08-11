/* eslint-disable @typescript-eslint/ban-ts-comment */
import { describe, expect, expectTypeOf, test } from 'vitest';

import { findPackages, getProjectDependencies } from '../find';
import { findPnpmConfig } from '../root-config';
import { ProjectsGraph } from '../project-graph';

const cwd = process.cwd();

describe('findPackages function', () => {
  test('should return selectedProjects and allProjects correctly when given valid input', async () => {
    // Positive test case
    const result = await findPackages(cwd);

    expectTypeOf(result).toBeArray();
  });
});

describe('getProjectDependencies function', async () => {
  // @ts-expect-error
  const { root, packages } = await findPnpmConfig(cwd);

  test('should return selectedProjects and allProjects', async () => {
    const result = await getProjectDependencies(
      // ['@chaos-design/eslint-config-basic'],
      [],
      {
        rootPath: root,
        patterns: packages,
        ignore: [
          '**/node_modules/**',
          '**/.git/**',
          '**/.gitignore',
          '**/.pnpm-store/**',
        ],
      },
    );

    const graph = new ProjectsGraph({
      projects: result.allProjects,
    });

    const nameSet = new Set<string>();

    result.selectedProjects.forEach((s: any) => {
      // @ts-expect-error
      graph.getWorkspaceDependencies(s.manifest.name).forEach((name) => {
        nameSet.add(name);
      });
    });

    expectTypeOf(nameSet).toEqualTypeOf(new Set<string>());

    expectTypeOf(result.selectedProjects).toBeArray();
    expectTypeOf(result.allProjects).toBeArray();
  });

  test('should handle invalid input and return empty arrays', async () => {
    // Negative test case
    const result = await getProjectDependencies([], {
      rootPath: '../',
      patterns: packages,
      ignore: [
        '**/node_modules/**',
        '**/.git/**',
        '**/.gitignore',
        '**/.pnpm-store/**',
      ],
    });

    expect(result.selectedProjects).toEqual([]);
    expect(result.allProjects).toEqual([]);
  });
});
