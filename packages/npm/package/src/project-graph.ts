/* eslint-disable @typescript-eslint/ban-ts-comment */
import { findPackages } from './find';
import { PromiseType } from './root-config';

export function isWorkspacePackageSpec(spec: string) {
  // eslint-disable-next-line regexp/no-unused-capturing-group
  return /^workspace:(.+)$/.test(spec);
}

type Project = PromiseType<ReturnType<typeof findPackages>>[0];

interface ProjectsGraphOptions {
  projects: Project[];
  depFields?: string[];
}

export class ProjectsGraph {
  public projectMap: Map<string, Project>;
  public workspaceDependenciesMap: Map<string, string[]>;
  public dependenciesMap: Map<string, string[]>;

  constructor(public options: ProjectsGraphOptions) {
    this.options = {
      ...options,
    };
    this.options.depFields = this.options.depFields || [
      'dependencies',
      'devDependencies',
      'peerDependencies',
    ];

    this.projectMap = new Map<string, Project>();
    this.workspaceDependenciesMap = new Map();
    this.dependenciesMap = new Map();

    this.options.projects.forEach((p) => {
      if (p.manifest.name) {
        this.projectMap.set(p.manifest.name, p);
      }
    });
  }

  getWorkspaceDependencies(name: string) {
    if (this.workspaceDependenciesMap.get(name)) {
      return this.workspaceDependenciesMap.get(name);
    }

    const proj = this.projectMap.get(name);
    if (!proj) {
      throw new Error(`${name} project is not found.`);
    }

    const depSet = new Set<string>();

    (this.options.depFields || []).forEach((f) => {
      // @ts-expect-error
      const deps = proj.manifest[f] || {};

      Object.keys(deps).forEach((name) => {
        if (isWorkspacePackageSpec(deps[name])) {
          depSet.add(name);
        }
      });
    });

    const res = Array.from(depSet);
    this.workspaceDependenciesMap.set(name, res);
    return res;
  }

  _walkTmp = new Map();

  getDependencies(name: string) {
    if (this.dependenciesMap.get(name)) {
      return this.dependenciesMap.get(name);
    }

    if (this._walkTmp.get(name)) {
      return [];
    }

    this._walkTmp.set(name, true);
    const depNames = this.getWorkspaceDependencies(name);
    const nameSet = new Set<string>(depNames);

    (depNames || []).forEach((n) => {
      if (name === n) {
        console.error(`${n} circle depend itself.`);
        return;
      }

      // @ts-expect-error
      this.getDependencies(n).forEach((x) => {
        nameSet.add(x);
      });
    });

    const res = Array.from(nameSet);

    this.dependenciesMap.set(name, res);
    this._walkTmp.delete(name);

    return res;
  }
}
