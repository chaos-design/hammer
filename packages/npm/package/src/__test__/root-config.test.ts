/* eslint-disable @typescript-eslint/ban-ts-comment */

import readYamlFile from 'read-yaml-file';
import { describe, expect, test } from 'vitest';
import {
  findLernaConfig,
  findPackageRootConfig,
  findPnpmConfig,
} from '../root-config';

describe('find package', () => {
  test('findPackageRootConfig', async () => {
    const cwd = process.cwd();
    // @ts-expect-error
    const { baseName, packages } = await findPackageRootConfig(cwd, {
      name: 'pnpm-workspace.yaml',
      handlePackagesInfo: async (data: any) => {
        const { fileName, baseName, root } = data || {};

        return {
          packages: ((await readYamlFile(fileName)) as any).packages,
          fileName,
          baseName,
          root,
        };
      },
    });

    expect({ baseName, packages }).toEqual({
      baseName: 'pnpm-workspace.yaml',
      packages: [
        'packages/*',
        'packages/config/*',
        'packages/config/eslint-config/*',
        'packages/config/eslint-plugin/*',
        'packages/config/tsconfig/*',
        'packages/utils/*',
        'packages/run/*',
        'packages/npm/*',
      ],
    });
  });

  test('findPnpmConfig', async () => {
    const cwd = process.cwd();
    // @ts-expect-error
    const { baseName, packages } = await findPnpmConfig(cwd);

    expect({ baseName, packages }).toEqual({
      baseName: 'pnpm-workspace.yaml',
      packages: [
        'packages/*',
        'packages/config/*',
        'packages/config/eslint-config/*',
        'packages/config/eslint-plugin/*',
        'packages/config/tsconfig/*',
        'packages/utils/*',
        'packages/run/*',
        'packages/npm/*',
      ],
    });
  });

  test('findLernaConfig', async () => {
    const cwd = process.cwd();
    const { baseName, packages } =
      (await findLernaConfig(cwd, { silent: true })) || {};

    expect({ baseName, packages }).toEqual({
      baseName: undefined,
      packages: undefined,
    });
  });
});
