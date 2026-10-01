# @chaos-design/publish

[简体中文](./README.zh-CN.md)

Publish several workspace packages with a single `pnpm publish` call, in
dependency order so the registry already has each dependency when its dependent
is published.

## Installation

```bash
npm install -g @chaos-design/publish
```

## CLI

Two binaries are installed: `batch-publish` and its short alias `cbp`.

```bash
# Publish the package in the current directory plus its workspace dependencies
cbp

# Publish specific packages (repeatable)
cbp --filter @chaos-design/calendar --filter @chaos-design/color-picker

# Print the command without running it
cbp --dry-run

# Pass anything after `--` straight to `pnpm publish`
cbp --filter @chaos-design/task -- --access public
```

| Option              | Description                                                        |
| ------------------- | ------------------------------------------------------------------ |
| `-f, --filter <pkg>`| Package to publish. Repeatable. Defaults to the current package.   |
| `--cwd <dir>`       | Resolve the workspace from `dir`. Defaults to the current directory.|
| `--dry-run`         | Print the resolved command without publishing.                     |
| `--force`           | Publish even when nothing matches the filter.                      |
| `--all-deps`        | Treat `devDependencies` as publish blockers too.                    |
| `--quiet`           | Do not log the resolved packages or command.                        |
| `--tail-command <s>`| Append an argument to the `pnpm publish` invocation. Repeatable.    |

### Exit codes

`0` on success, `1` when the filter matches nothing (unless `--force`) or when
no workspace config is found.

## API

```ts
import { pnpmPublish, resolvePublishPackages } from '@chaos-design/publish';

// Print the command that would run, without publishing anything.
await pnpmPublish({ filter: ['@chaos-design/calendar'], dryRun: true });

// Just the ordering, resolved against the workspace.
const order = await resolvePublishPackages(['@chaos-design/calendar'], {
  cwd: process.cwd(),
  ignore: ['**/node_modules/**'],
  onlyDependencies: true,
});
// -> ['@chaos-design/shadcn-kits', '@chaos-design/color-picker', ...]
```

Both helpers resolve the workspace root by walking up from `cwd`, so they work
from any subdirectory.

Arguments are passed to `pnpm` as an argv array via `execFileSync`, never
interpolated into a shell string.

## How ordering works

`resolvePublishPackages` reads `pnpm-workspace.yaml`, discovers the projects,
then walks `ProjectsGraph` from each selected package. Dependencies are added to
the result before the package that requires them, and each package appears once.
Cycles are safe: a package already on the current walk path is skipped.

By default only `dependencies` and `peerDependencies` count as blockers. Pass
`--all-deps` (`onlyDependencies: false`) to include `devDependencies` too.

## License

[MIT](../../../LICENSE)