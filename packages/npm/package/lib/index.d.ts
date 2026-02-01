import * as _pnpm_types from '@pnpm/types';
import { Options } from '@pnpm/fs.find-packages';

declare const findPackages: (dir: string, opts?: Options) => Promise<_pnpm_types.Project[]>;
declare function getProjectDependencies(ignore: string[], { rootPath, ...opts }: Options & {
    rootPath: string;
}): Promise<{
    selectedProjects: any[];
    allProjects: _pnpm_types.Project[];
}>;

declare const readJsonFile: (path: string) => Promise<string>;
interface FindPackageRootOptions {
    name: string | string[];
    silent?: boolean;
}
declare function findPackageRoot(dir: string, { silent, name }: FindPackageRootOptions): Promise<{
    fileName: string;
    baseName: string;
    root: string;
    packages: undefined;
} | undefined>;
type FindPackageRootValues = ReturnType<typeof findPackageRoot> & {
    packages?: any;
};
type PromiseType<T> = T extends Promise<infer U> ? U : never;
declare function findPackageRootConfig(dir: string, opts: FindPackageRootOptions & {
    handlePackagesInfo: (data: PromiseType<FindPackageRootValues>) => FindPackageRootValues;
}): Promise<FindPackageRootValues>;
declare function findPnpmConfig(dir: string, opts?: Partial<FindPackageRootOptions>): Promise<{
    fileName: string;
    baseName: string;
    root: string;
    packages: undefined;
} | undefined>;
declare function findLernaConfig(dir: string, opts?: Partial<FindPackageRootOptions>): Promise<{
    fileName: string;
    baseName: string;
    root: string;
    packages: undefined;
} | undefined>;

declare function isWorkspacePackageSpec(spec: string): boolean;
type Project = PromiseType<ReturnType<typeof findPackages>>[0];
interface ProjectsGraphOptions {
    projects: Project[];
    depFields?: string[];
}
declare class ProjectsGraph {
    options: ProjectsGraphOptions;
    projectMap: Map<string, Project>;
    workspaceDependenciesMap: Map<string, string[]>;
    dependenciesMap: Map<string, string[]>;
    constructor(options: ProjectsGraphOptions);
    getWorkspaceDependencies(name: string): string[] | undefined;
    _walkTmp: Map<any, any>;
    getDependencies(name: string): string[] | undefined;
}

export { type FindPackageRootOptions, ProjectsGraph, type PromiseType, findLernaConfig, findPackageRoot, findPackageRootConfig, findPackages, findPnpmConfig, getProjectDependencies, isWorkspacePackageSpec, readJsonFile };
