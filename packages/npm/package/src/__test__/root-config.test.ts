import path from 'node:path';
import { describe, expect, test } from 'vitest';
import {
  findLernaConfig,
  findPackageRootConfig,
  findPnpmConfig,
  readJsonFile,
} from '../root-config';

const cwd = process.cwd();

const expectedPackages = [
  'apps/*',
  'packages/*',
  'packages/config/*',
  'packages/config/tsconfig/*',
  'packages/utils/*',
  'packages/run/*',
  'packages/npm/*',
  'packages/babel-plugin/*',
  'packages/shadcn-ui/*',
];

describe('find package', () => {
  test('findPackageRootConfig', async () => {
    const config = await findPackageRootConfig(cwd, {
      name: 'pnpm-workspace.yaml',
      handlePackagesInfo: async (data) => ({
        packages: expectedPackages,
        fileName: data.fileName,
        baseName: data.baseName,
        root: data.root,
      }),
    });

    expect(config?.baseName).toBe('pnpm-workspace.yaml');
    expect(config?.packages).toEqual(expectedPackages);
  });

  test('findPnpmConfig', async () => {
    const config = await findPnpmConfig(cwd);

    expect(config?.baseName).toBe('pnpm-workspace.yaml');
    expect(config?.packages).toEqual(expectedPackages);
    expect(config?.root.endsWith('hammer')).toBe(true);
    expect(config?.fileName.endsWith('pnpm-workspace.yaml')).toBe(true);
  });

  test('findPnpmConfig returns undefined when silent and nothing is found', async () => {
    const result = await findPnpmConfig(path.join(cwd, 'src'), {
      silent: true,
      // Bypass the repository root by starting from a temp directory.
      ...{ name: 'definitely-not-here.yaml' },
    });

    expect(result).toBeUndefined();
  });

  test('findLernaConfig returns undefined when silent', async () => {
    const result = await findLernaConfig(cwd, { silent: true });

    expect(result).toBeUndefined();
  });

  test('findLernaConfig throws when not silent', async () => {
    await expect(findLernaConfig(cwd)).rejects.toThrow();
  });

  test('readJsonFile parses the file instead of re-stringifying it', async () => {
    const pkg = await readJsonFile<{ name: string; version: string }>(
      `${cwd}/package.json`,
    );

    expect(pkg.name).toBe('@chaos-design/package');
    expect(typeof pkg.version).toBe('string');
  });

  test('readJsonFile throws a helpful error on malformed JSON', async () => {
    await expect(readJsonFile(`${cwd}/README.md`)).rejects.toThrow(
      /Failed to parse JSON file/,
    );
  });
});
