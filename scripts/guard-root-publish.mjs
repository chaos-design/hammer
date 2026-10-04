/**
 * Guard against `pnpm publish` run in the workspace root.
 *
 * The root is a container for the tooling, not a publishable package: it declares
 * no `files`, no entry point and no `bin`, so packing it yields a tarball of the
 * whole repository — CI workflows and the docs app included. `private: true` is
 * the only thing standing between that tarball and a public upload, and npm
 * reports it as a bare `EPRIVATE`, which reads like a broken manifest rather than
 * a wrong command.
 *
 * Deleting `private` to silence the error is the one response that turns a failed
 * publish into a published repository, so this names the command to run instead.
 */

console.error(
  [
    '✗ the workspace root is not a publishable package.',
    '',
    '  It is marked private on purpose. It declares no `files`, no entry point and',
    '  no `bin`, so publishing this directory would upload the entire repository —',
    '  .github workflows and apps/docs included. Removing `private` to clear this',
    '  error is what turns a failed publish into a published repository.',
    '',
    '  To publish the public workspace packages, in dependency order, skipping',
    '  versions already on the registry:',
    '',
    '      pnpm run publish-pkg',
    '',
    '  To see what that would do, without publishing it:',
    '',
    '      pnpm run publish-pkg --dry-run',
    '',
  ].join('\n'),
);

process.exit(1);
