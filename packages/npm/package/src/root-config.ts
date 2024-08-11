/* eslint-disable @typescript-eslint/ban-ts-comment */
import * as nps from 'node:path';
import * as fs from 'node:fs';
import readYamlFile from 'read-yaml-file';
import { findUp } from 'find-up';

export const readJsonFile = async (path: string) => {
  const text = await fs.promises.readFile(path, 'utf-8');

  return JSON.stringify(text);
};

export interface FindPackageRootOptions {
  name: string | string[];
  silent?: boolean;
}
export async function findPackageRoot(
  dir: string,
  { silent = false, name }: FindPackageRootOptions,
) {
  if (name) {
    try {
      const fileName = await findUp(name, { type: 'file', cwd: dir });

      if (!fileName) {
        return;
      }

      const dirName = nps.dirname(fileName);
      const baseName = nps.basename(fileName);

      return { fileName, baseName, root: dirName, packages: undefined };
    } catch (error) {
      if (silent) {
        return;
      }

      throw new Error(error as string);
    }
  }
  if (silent) {
    return;
  }

  throw new Error('Not found packages config.');
}

type FindPackageRootValues = ReturnType<typeof findPackageRoot> & {
  packages?: any;
};

export type PromiseType<T> = T extends Promise<infer U> ? U : never;

export async function findPackageRootConfig(
  dir: string,
  opts: FindPackageRootOptions & {
    handlePackagesInfo: (
      data: PromiseType<FindPackageRootValues>,
    ) => FindPackageRootValues;
  },
): Promise<FindPackageRootValues> {
  const data = await findPackageRoot(dir, opts);
  if (!data) {
    if (opts?.silent) {
      return;
    }

    throw new Error('Not found packages config.');
  }

  if (!opts.handlePackagesInfo) {
    if (opts?.silent) {
      return;
    }

    throw new Error('opts must have handlePackagesInfo');
  }

  return opts.handlePackagesInfo(data);
}

export async function findPnpmConfig(
  dir: string,
  opts: Partial<FindPackageRootOptions> = {},
) {
  return await findPackageRootConfig(dir, {
    name: 'pnpm-workspace.yaml',
    // @ts-expect-error
    handlePackagesInfo: async (data) => {
      const { fileName, baseName, root } = data || {};

      return {
        packages: !fileName
          ? undefined
          : ((await readYamlFile(fileName)) as any).packages,
        fileName,
        baseName,
        root,
      };
    },
    ...opts,
  });
}

export async function findLernaConfig(
  dir: string,
  opts: Partial<FindPackageRootOptions> = {},
) {
  return await findPackageRootConfig(dir, {
    name: 'lerna.json',
    // @ts-expect-error
    handlePackagesInfo: async (data) => {
      const { fileName, baseName, root } = data || {};

      return {
        packages: !fileName
          ? undefined
          : ((await readJsonFile(fileName)) as any).packages,
        fileName,
        baseName,
        root,
      };
    },
    ...opts,
  });
}
