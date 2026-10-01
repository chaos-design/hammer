# @chaos-design/utils-pkg

[简体中文](./README.zh-CN.md)

Map changed files to the workspace packages that own them. Useful for deciding
which packages a commit affects, so only those need to be built, versioned or
published.

## Installation

```bash
npm install @chaos-design/utils-pkg
```

## Usage

```ts
import { getChangedPackages } from '@chaos-design/utils-pkg';

// Packages touched by the last commit.
const packages = getChangedPackages();
// -> [{ name: '@chaos-design/calendar', version: '0.0.3', path: 'packages/…/package.json' }]
```

Each package appears once, in the order it was first encountered.

### Filtering by path

Both `getChangedPackages` and `checkFiles` accept a list of patterns to skip.

```ts
getChangedPackages('HEAD^1', ['**/*.md', 'docs/.*']);
```

### Working without git

`checkFiles` maps an explicit file list, so it works anywhere — no repository
required.

```ts
import { checkFiles, getPackageInfo } from '@chaos-design/utils-pkg';

checkFiles(['packages/utils/pkg/src/index.ts']);
// -> [{ name: '@chaos-design/utils-pkg', … }]

getPackageInfo('packages/utils/pkg/src/index.ts');
// -> { name: '@chaos-design/utils-pkg', version: '0.1.0', path: '…/package.json' }
```

`getPackageInfo` resolves `null` when the file does not exist, has no
`package.json` beside it, or the manifest is missing a `name`/`version`.

`getChangedFiles` reads `git diff <commitId> --name-only` and resolves to `[]`
outside a repository, or when the commit does not exist.

### Deduplicating

```ts
import { uniqueChangedPackages } from '@chaos-design/utils-pkg';

uniqueChangedPackages([
  { name: 'a', version: '1.0.0', path: '/a/package.json' },
  { name: 'a', version: '2.0.0', path: '/a/package.json' },
]);
// -> [{ name: 'a', version: '1.0.0', … }]
```

## API

| Export                                             | Description                                     |
| -------------------------------------------------- | ----------------------------------------------- |
| `getChangedPackages(commitId?, ignorePath?)`       | Packages touched by a commit, deduplicated.     |
| `getChangedFiles(commitId?, cwd?)`                 | Files changed by a commit.                      |
| `checkFiles(files, ignorePath?)`                   | Map an explicit file list to packages.          |
| `getPackageInfo(file)`                             | The package that owns a file.                   |
| `uniqueChangedPackages(packages)`                  | Keep the first entry per package name.          |
| `PackageInfo`                                      | `{ name, version, path }`                       |

## License

[MIT](../../../LICENSE)