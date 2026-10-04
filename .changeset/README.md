---
"@chaos-design/utils-pkg": minor
---

A changeset describes one user-visible change to one or more packages. Write it
in the same pull request as the change itself, using `major`, `minor`, `patch` or
`none` per package:

```md
---
"@chaos-design/calendar": minor
"@chaos-design/classnames": patch
---

Add a `weekStartsOn` prop to `Calendar`.
```

Pushing a changeset to `main` opens (or updates) a **Version Packages** pull
request. Merging that pull request is the only manual step in a release: it
raises the versions, writes each package's `CHANGELOG.md`, and the resulting push
to `main` publishes the new versions to npm.

Run `pnpm changeset` to create one interactively.