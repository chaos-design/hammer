/* eslint-disable @typescript-eslint/ban-ts-comment */
import { describe, expectTypeOf, test } from 'vitest';

import { getProjectDependencies } from '../find';
import { ProjectsGraph } from '../project-graph';
import { findPnpmConfig } from '../root-config';

const cwd = process.cwd();
describe('getProjectDependencies function', async () => {
  // @ts-expect-error
  const { root, packages } = await findPnpmConfig(cwd);
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

  test('should return selectedProjects and allProjects', async () => {
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
  });
});
