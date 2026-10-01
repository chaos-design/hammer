import type { Project } from './find';

const WORKSPACE_SPEC_RE = /^workspace:.*$/;

export function isWorkspacePackageSpec(spec: string) {
  return WORKSPACE_SPEC_RE.test(spec);
}

const DEFAULT_DEP_FIELDS = [
  'dependencies',
  'devDependencies',
  'peerDependencies',
];

export interface ProjectsGraphOptions {
  projects: Project[];
  depFields?: string[];
}

type ManifestWithDepFields = Project['manifest'] & Record<string, unknown>;

export class ProjectsGraph {
  public projectMap: Map<string, Project>;
  public workspaceDependenciesMap: Map<string, string[]>;
  public dependenciesMap: Map<string, string[]>;
  public options: ProjectsGraphOptions;

  constructor(options: ProjectsGraphOptions) {
    this.options = {
      ...options,
      depFields: options.depFields ?? DEFAULT_DEP_FIELDS,
    };

    this.projectMap = new Map<string, Project>();
    this.workspaceDependenciesMap = new Map();
    this.dependenciesMap = new Map();

    for (const project of this.options.projects) {
      if (project.manifest.name) {
        this.projectMap.set(project.manifest.name, project);
      }
    }
  }

  /** Direct workspace (`workspace:*`) dependencies of `name`. */
  getWorkspaceDependencies(name: string): string[] {
    const cached = this.workspaceDependenciesMap.get(name);
    if (cached) return cached;

    const project = this.projectMap.get(name);
    if (!project) {
      throw new Error(`${name} project is not found.`);
    }

    const manifest = project.manifest as ManifestWithDepFields;
    const depSet = new Set<string>();

    for (const field of this.options.depFields ?? DEFAULT_DEP_FIELDS) {
      const deps = (manifest[field] as Record<string, string>) ?? {};

      for (const [depName, spec] of Object.entries(deps)) {
        if (isWorkspacePackageSpec(spec)) {
          depSet.add(depName);
        }
      }
    }

    const result = [...depSet];
    this.workspaceDependenciesMap.set(name, result);

    return result;
  }

  /** Projects currently being visited, used to break dependency cycles. */
  private walking = new Set<string>();

  /** Transitive workspace dependencies of `name`, including itself's deps. */
  getDependencies(name: string): string[] {
    const cached = this.dependenciesMap.get(name);
    if (cached) return cached;

    // A cycle was detected: stop walking and let the caller continue.
    if (this.walking.has(name)) return [];

    this.walking.add(name);

    try {
      const nameSet = new Set<string>(this.getWorkspaceDependencies(name));

      for (const dep of nameSet) {
        if (dep === name) {
          console.error(`${name} circle depend itself.`);
          nameSet.delete(dep);
          continue;
        }

        for (const transitive of this.getDependencies(dep)) {
          nameSet.add(transitive);
        }
      }

      const result = [...nameSet];
      this.dependenciesMap.set(name, result);

      return result;
    } finally {
      this.walking.delete(name);
    }
  }
}
