# @chaos-design/hammer

![@chaos-design/hammer](./assets/banner.png)

A pnpm monorepo holding the tooling and UI packages used by
[chaos-design](https://github.com/chaos-design) — forged for the monorepo.

**[简体中文](./README.zh-CN.md)**

## Packages

See [packages.md](./packages.md) for the generated list with versions.

| Package                                                                        | Description                                          |
| ------------------------------------------------------------------------------ | ---------------------------------------------------- |
| [`@chaos-design/babel-plugin-jsx-source-location`](./packages/babel-plugin/jsx-source-location) | Babel plugin adding source locations to JSX |
| [`@chaos-design/tsconfig`](./packages/config/tsconfig/chaos)                    | Shared TypeScript base config                      |
| [`@chaos-design/package`](./packages/npm/package)                               | Workspace discovery and dependency graph           |
| [`@chaos-design/publish`](./packages/npm/publish)                               | Batch-publish workspace packages                    |
| [`@chaos-design/task`](./packages/run/task)                                     | Fluent interface for running a task                 |
| [`@chaos-design/classnames`](./packages/utils/classnames)                       | Conditionally join class names, with prefixing      |
| [`@chaos-design/utils-pkg`](./packages/utils/pkg)                               | Map changed files to their owning packages          |
| [`@chaos-design/calendar`](./packages/shadcn-ui/calendar)                       | Calendar scheduler component                        |
| [`@chaos-design/color-picker`](./packages/shadcn-ui/color-picker)               | Colour picker with HEX / RGB / HSB input            |
| [`@chaos-design/month-datepicker`](./packages/shadcn-ui/month-datepicker)       | Month and year picker                               |
| [`@chaos-design/shadcn-kits`](./packages/shadcn-ui/shadcn-kits)                | Shared shadcn/ui utilities                          |

## Layout

```text
apps/docs/            # Next.js documentation site (private)
packages/
  babel-plugin/       # Babel plugins
  config/tsconfig/    # Shared tsconfig presets
  npm/                # @chaos-design/package, @chaos-design/publish
  run/                # @chaos-design/task
  shadcn-ui/          # React component libraries
  utils/              # @chaos-design/classnames, @chaos-design/utils-pkg
scripts/              # Release, lint and verification tooling
```

## Requirements

- Node.js 20 or newer
- pnpm 9.15.9 (pinned via `packageManager`; the repo installs pnpm only)

## Development

```sh
pnpm install
pnpm dev            # watch all packages
pnpm build          # build all packages
```

### Quality gates

| Command                   | What it does                                                     |
| ------------------------- | ---------------------------------------------------------------- |
| `pnpm lint`               | Biome lint across the workspace.                                 |
| `pnpm format`             | Format files with Biome.                                         |
| `pnpm check`              | Lint and apply safe fixes.                                       |
| `pnpm typecheck`          | `tsc` over every package.                                        |
| `pnpm test`               | Vitest over every package.                                       |
| `pnpm verify-publishable` | Check that each package can actually be published.               |
| `pnpm verify-peers`       | Check the peer dependency contract.                              |
| `pnpm verify`             | All of the above, in order.                                      |

`pnpm verify-publishable` fails when a package name is duplicated, when `files`
omits an entry point, or when a `workspace:` dependency has no version to
publish.

`pnpm verify-peers` fails on **phantom dependencies** — an import that only
resolves because a hoisted `node_modules` happened to place it there — and when
`react` is declared as a dependency instead of a peer. It is the fastest way to
catch a broken release before CI does.

### Linting and formatting

Linting and formatting use [Biome](https://biomejs.dev/). Vendored shadcn/ui
sources and Tailwind at-rules are exempted in `biome.json` via `overrides`
rather than by mutating third-party code.

## Releasing

Releases are versioned together for the tooling packages, independently for the
UI components.

```sh
# 1. Bump the version of every package changed since the last commit.
pnpm run bump-version

# 2. Review the diff, commit, tag, and push.
git commit -am "chore: release" && git tag v0.1.0 && git push --follow-tags

# 3. CI builds, verifies and publishes in dependency order.
```

`pnpm run bump-version` only touches the `package.json` files that changed in
the last commit. It falls back to every publishable package when git cannot
report a diff, so it never silently does nothing.

To publish without bumping — for example a package whose `prepublishOnly` needs
re-running:

```sh
# Everything, skipping versions already on the registry.
pnpm run publish-pkg

# A single package (plus its workspace dependencies, in publish order).
pnpm run publish-pkg @chaos-design/calendar

# Show what would happen without publishing.
node scripts/publish-ci.mjs --dry-run
```

`scripts/publish-ci.mjs` sorts packages so a dependency is always published
before its dependents, verifies every entry point exists on disk, and skips
versions already present on the registry.

### Publishing order matters

A `workspace:*` dependency is rewritten to the concrete version at publish time.
Publishing a dependent before its dependency fails when that version is not yet
on the registry. This is why the publish script sorts topologically rather than
following directory order.

## Dependency resolution

This workspace uses pnpm's **isolated** `node_modules` (the default). It
previously used `node-linker=hoisted`, which flattens the tree npm-style and
hides two classes of defect:

- **Phantom dependencies.** An import of a package that is never declared still
  resolves, so the package only breaks once published.
- **Undeclared type imports.** A `.d.ts` can reference a package that is not a
  declared dependency, producing `TS2742 … cannot be named without a reference
  to …` for consumers.

Both were present in this repository. `pnpm verify-peers` now fails the build on
either, so the regression cannot come back.

The trade-off: a missing dependency is now a hard error at install time rather
than a runtime surprise. That is the intended behaviour for a monorepo whose
artifacts are published to npm.

## CI

| Workflow                | Trigger                          | Does                                              |
| ----------------------- | -------------------------------- | ------------------------------------------------- |
| `ci.yml`                | Push to `main`, any PR           | Lint, typecheck, test, build, verify-publishable. |
| `publish.yml`           | Push to `main`, tag `v*`, manual | Lint, test, typecheck, build, then publish.        |
| `deploy-docs.yml`       | Docs or shadcn packages change   | Build and deploy the docs site to GitHub Pages.   |

## License

[MIT](./LICENSE) © 2023-PRESENT [chaos-design](https://github.com/chaos-design)