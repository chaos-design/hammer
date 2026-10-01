/* eslint-disable @typescript-eslint/ban-ts-comment */

import * as fs from 'node:fs';
import * as nps from 'node:path';
import { findUp } from 'find-up';
import readYamlFile from 'read-yaml-file';

export interface FindPackageRootOptions {
  name: string | string[];
  silent?: boolean;
}

export interface FindPackageRootResult {
  fileName: string;
  baseName: string;
  root: string;
}

/**
 * Walk up the directory tree starting at `dir` until one of the given file
 * names is found.
 *
 * When `silent` is `true` a missing file resolves to `undefined` instead of
 * throwing, which keeps callers free of try/catch noise.
 */
export async function findPackageRoot(
  dir: string,
  { silent = false, name }: FindPackageRootOptions,
): Promise<FindPackageRootResult | undefined> {
  try {
    const fileName = await findUp(name, { type: 'file', cwd: dir });

    if (!fileName) {
      if (silent) return undefined;
      throw new Error(`Not found packages config: ${name}`);
    }

    return {
      fileName,
      baseName: nps.basename(fileName),
      root: nps.dirname(fileName),
    };
  } catch (error) {
    if (silent) return undefined;
    throw error;
  }
}

/**
 * Resolve the workspace root, then let the caller derive extra data from it.
 *
 * Resolves with `undefined` instead of throwing when nothing is found and
 * `silent` is set.
 */
export async function findPackageRootConfig<T>(
  dir: string,
  opts: FindPackageRootOptions & {
    handlePackagesInfo: (data: FindPackageRootResult) => Promise<T> | T;
  },
): Promise<T | undefined> {
  if (!opts?.handlePackagesInfo) {
    if (opts?.silent) return undefined;
    throw new Error('opts must have handlePackagesInfo');
  }

  const data = await findPackageRoot(dir, opts);

  if (!data) {
    if (opts?.silent) return undefined;
    throw new Error('Not found packages config.');
  }

  return await opts.handlePackagesInfo(data);
}

export type PromiseType<T> = T extends Promise<infer U> ? U : never;

/** Read a JSON file and return its parsed contents. */
export async function readJsonFile<T = unknown>(path: string): Promise<T> {
  const text = await fs.promises.readFile(path, 'utf-8');

  try {
    return JSON.parse(text) as T;
  } catch (error) {
    throw new Error(`Failed to parse JSON file "${path}": ${String(error)}`);
  }
}

export interface WorkspaceConfigResult {
  packages?: string[];
  fileName: string;
  baseName: string;
  root: string;
}

/**
 * Read `pnpm-workspace.yaml` by walking up from `dir`.
 *
 * Throws when no config is found, unless `{ silent: true }` is passed.
 */
export async function findPnpmConfig(
  dir: string,
  opts: Partial<FindPackageRootOptions> = {},
): Promise<WorkspaceConfigResult | undefined> {
  return await findPackageRootConfig<WorkspaceConfigResult>(dir, {
    name: 'pnpm-workspace.yaml',
    handlePackagesInfo: async (data) => {
      const manifest = (await readYamlFile(data.fileName)) as {
        packages?: string[];
      } | null;

      return {
        packages: manifest?.packages,
        fileName: data.fileName,
        baseName: data.baseName,
        root: data.root,
      };
    },
    ...opts,
  });
}

export async function findLernaConfig(
  dir: string,
  opts: Partial<FindPackageRootOptions> = {},
): Promise<WorkspaceConfigResult | undefined> {
  return await findPackageRootConfig<WorkspaceConfigResult>(dir, {
    name: 'lerna.json',
    handlePackagesInfo: async (data) => {
      const manifest = await readJsonFile<{ packages?: string[] }>(
        data.fileName,
      );

      return {
        packages: manifest?.packages,
        fileName: data.fileName,
        baseName: data.baseName,
        root: data.root,
      };
    },
    ...opts,
  });
}
