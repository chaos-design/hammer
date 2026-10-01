# @chaos-design/package

[简体中文](./README.zh-CN.md)

Locate a monorepo's workspace packages, read its root config, and walk the
`workspace:` dependency graph between them.

Works with any layout, because projects are discovered with
[`@pnpm/fs.find-packages`](https://www.npmjs.com/package/@pnpm/fs.find-packages)
and the root config is found by walking up from a given directory.

## Installation

```bash
npm install @chaos-design/package
```

## Usage

### Read the root config

```ts
import { findPnpmConfig, findLernaConfig } from '@chaos-design/package';

const { packages, root, fileName, baseName } = await findPnpmConfig(process.cwd());
```

Both helpers resolve with `{ packages, fileName, baseName, root }` where
`packages` is the list of workspace globs.

Pass `{ silent: true }` to get `undefined` instead of a thrown error when no
config is found:

```ts
const config = await findPnpmConfig(cwd, { silent: true });
if (!config) return;
```

### Filter projects

`getProjectDependencies` resolves the projects under `rootPath` and narrows them
down. Each rule is interpreted by its shape:

| Rule shape  | Meaning                                    | Example         |
| ----------- | ------------------------------------------ | --------------- |
| `./x`       | Glob matched against the project directory. | `./publish`     |
| `{x}`       | Same as `./x`, shorthand.                   | `{publish}`     |
| anything else| Glob matched against `package.json#name`.  | `@chaos-design/task` |

```ts
import { findPnpmConfig, getProjectDependencies } from '@chaos-design/package';

const { packages, root } = await findPnpmConfig(cwd);

const { selectedProjects, allProjects } = await getProjectDependencies(
  ['./publish'],
  { rootPath: root!, patterns: packages },
);
```

When both kinds of rule are present, directory globs win. With no rules at all,
every project is selected.

### Walk the dependency graph

`ProjectsGraph` resolves `workspace:*` dependencies transitively, with cycle
protection. Only the dependency fields you list are considered; the default is
`dependencies`, `devDependencies` and `peerDependencies`.

```ts
import { ProjectsGraph } from '@chaos-design/package';

const graph = new ProjectsGraph({
  projects: allProjects,
  depFields: ['dependencies'],
});

graph.getWorkspaceDependencies('@chaos-design/calendar');
// -> ['@chaos-design/shadcn-kits', '@chaos-design/color-picker', ...]

graph.getDependencies('@chaos-design/calendar');
// -> the same list, resolved transitively
```

Results are memoised, so repeated calls are cheap. An unknown project name
throws `<name> project is not found.`

### Find any file upward

`findPackageRoot` / `findPackageRootConfig` are the generic building blocks used
by `findPnpmConfig` and `findLernaConfig`. Use them to locate an arbitrary file
from a nested directory:

```ts
import { findPackageRoot } from '@chaos-design/package';

const found = await findPackageRoot(cwd, {
  name: ['pnpm-workspace.yaml', 'lerna.json'],
  silent: true,
});
// -> { fileName, baseName, root } | undefined
```

## API

| Export                                              | Description                                     |
| --------------------------------------------------- | ----------------------------------------------- |
| `findPackages(dir, opts?)`                          | List the projects under `dir`.                  |
| `getProjectDependencies(rules, opts)`               | List projects and a filtered `selectedProjects`. |
| `ProjectsGraph`                                     | Resolve workspace dependencies transitively.    |
| `isWorkspacePackageSpec(spec)`                      | Test a `workspace:` protocol spec.              |
| `findPackageRoot(dir, opts)`                        | Walk up to find a file.                         |
| `findPackageRootConfig(dir, opts)`                  | Walk up, then derive extra data from the result.|
| `findPnpmConfig(dir, opts?)`                        | Read `pnpm-workspace.yaml`.                     |
| `findLernaConfig(dir, opts?)`                       | Read `lerna.json`.                              |
| `readJsonFile(path)`                                | Read and parse a JSON file.                     |

## License

[MIT](../../../LICENSE)