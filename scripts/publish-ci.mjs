import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);

const IGNORED_DIRS = new Set([
  'node_modules',
  'dist',
  'lib',
  'coverage',
  'out',
]);

/** Find every directory under `packages` that holds a package.json. */
const findPackageDirs = (dir, found = []) => {
  let entries;

  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return found;
  }

  for (const entry of entries) {
    if (IGNORED_DIRS.has(entry.name) || entry.name.startsWith('.')) continue;

    const entryPath = path.join(dir, entry.name);

    if (entry.isDirectory()) findPackageDirs(entryPath, found);
    else if (entry.name === 'package.json') found.push(dir);
  }

  return found;
};

const readManifest = (dir) =>
  JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf-8'));

/** Names of the workspace packages a package depends on via `workspace:`. */
const workspaceDeps = (manifest) => {
  const deps = {
    ...(manifest.dependencies ?? {}),
    ...(manifest.peerDependencies ?? {}),
    ...(manifest.optionalDependencies ?? {}),
  };

  return Object.entries(deps)
    .filter(([, spec]) => String(spec).startsWith('workspace:'))
    .map(([name]) => name);
};

/**
 * Order packages so a dependency always comes before its dependents.
 *
 * pnpm resolves `workspace:` specs against the registry at publish time, so
 * publishing a dependent first fails when the dependency version is new.
 */
const sortTopologically = (packages) => {
  const byName = new Map(packages.map((p) => [p.manifest.name, p]));
  const visited = new Set();
  const visiting = new Set();
  const ordered = [];

  const visit = (pkg) => {
    if (visited.has(pkg.manifest.name)) return;

    if (visiting.has(pkg.manifest.name)) {
      // A cycle cannot be published in dependency order; break it and continue.
      console.warn(
        `  ! dependency cycle involving ${pkg.manifest.name}, continuing.`,
      );
      return;
    }

    visiting.add(pkg.manifest.name);

    for (const dep of workspaceDeps(pkg.manifest)) {
      const target = byName.get(dep);

      if (target) visit(target);
    }

    visiting.delete(pkg.manifest.name);
    visited.add(pkg.manifest.name);
    ordered.push(pkg);
  };

  for (const pkg of packages) visit(pkg);

  return ordered;
};

/** Fail loudly when a package points at entry files that were never built. */
const verifyEntryPoints = (dir, manifest) => {
  const missing = [];

  const check = (relative) => {
    if (!relative || typeof relative !== 'string') return;

    const resolved = relative.startsWith('./')
      ? path.join(dir, relative.slice(2))
      : path.join(dir, relative);

    if (!fs.existsSync(resolved)) missing.push(relative);
  };

  check(manifest.main);
  check(manifest.module);
  check(manifest.types);

  if (typeof manifest.exports === 'string') {
    check(manifest.exports);
  } else if (manifest.exports && typeof manifest.exports === 'object') {
    const visit = (node) => {
      if (typeof node === 'string') return check(node);

      if (node && typeof node === 'object') {
        for (const value of Object.values(node)) visit(value);
      }
    };

    visit(manifest.exports);
  }

  return [...new Set(missing)];
};

const isPublished = (name, version) => {
  try {
    const out = execFileSync('npm', ['view', `${name}@${version}`, 'version'], {
      stdio: ['ignore', 'pipe', 'ignore'],
      encoding: 'utf-8',
    }).trim();

    return out === version;
  } catch {
    // 404 or a network failure both mean "treat as not published".
    return false;
  }
};

// When this script runs as the `publish-script` of changesets/action, the action
// does not learn what was published from this process — it reads newline-delimited
// events from the file named by $CHANGESETS_OUTPUT and pushes a git tag and a GitHub
// release for each one. Staying silent leaves the action with nothing to work from,
// so it publishes successfully and then quietly creates no tags and no releases.
//
// Each line is the event changesets' own `git-tag` command emits: the tag it would
// have created, which for a workspace is `<name>@<version>` rather than `v<version>`.
const changesetsOutput = process.env.CHANGESETS_OUTPUT;

const recordPublished = ({ name, version }) => {
  if (!changesetsOutput) return;

  const event = {
    type: 'git-tag',
    tag: `${name}@${version}`,
    packageName: name,
  };

  fs.appendFileSync(changesetsOutput, `${JSON.stringify(event)}\n`);
};

// npm writes the packument of a brand-new package asynchronously, so a package
// published moments after another one is rejected with
// `E409 … Failed to save packument`. Nothing is wrong with the package: the
// registry has not finished registering its predecessor, and the same tarball is
// accepted once it catches up. That is why publishing a whole workspace for the
// first time tends to get a few packages out and then start failing, and why the
// packages that did land are left referencing versions that do not exist yet.
const PUBLISH_ATTEMPTS = 6;
const PUBLISH_BACKOFF_MS = 5000;

const isRegistryBusy = (output) => /\bE409\b|409 Conflict/.test(output);

// Packages must be published one at a time and in dependency order, so the pause
// between attempts cannot be awaited. `Atomics.wait` is the only clock available
// to a synchronous script.
const sleep = (ms) => {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
};

/**
 * Runs `pnpm publish` once in `dir`.
 *
 * Output is captured rather than inherited for two reasons: a failure has to be
 * classified before it can be reported, and a successful publish is mostly npm
 * notices repeating what the summary line already says.
 */
const runPublish = (dir) => {
  const result = spawnSync(
    'pnpm',
    ['publish', '--access', 'public', '--no-git-checks'],
    { cwd: dir, encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 },
  );

  return {
    ok: result.status === 0,
    output: `${result.stdout ?? ''}${result.stderr ?? ''}`,
  };
};

const publish = (dir, onRetry) => {
  for (let attempt = 1; ; attempt += 1) {
    const result = runPublish(dir);

    if (result.ok) return result;

    // Anything other than a busy registry — a rejected token, a missing entry
    // point, a version that already exists — will not fix itself.
    if (!isRegistryBusy(result.output) || attempt >= PUBLISH_ATTEMPTS) {
      return result;
    }

    const wait = PUBLISH_BACKOFF_MS * 2 ** (attempt - 1);

    onRetry(wait, attempt);
    sleep(wait);
  }
};

// ── output ───────────────────────────────────────────────────────────────────
// One line per package is the only thing a reader needs; everything else npm says
// is noise that buries it. `pnpm publish` runs the npm CLI, which warns about
// every `npm_config_*` variable pnpm exports — six lines per package, none of them
// actionable — and then prints a full tarball listing for a package that, if all
// goes well, nobody needs to read. So npm's report is shown when a publish fails
// and dropped when it succeeds, and the per-package result carries the run.

const useColor = Boolean(process.stdout.isTTY) && !process.env.NO_COLOR;

const paint = (code, text) => (useColor ? `[${code}m${text}[0m` : text);

const bold = (text) => paint(1, text);
const dim = (text) => paint(2, text);
const red = (text) => paint(31, text);
const green = (text) => paint(32, text);
const yellow = (text) => paint(33, text);

const formatDuration = (ms) =>
  ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`;

// npm's own report, kept to the lines that describe the failure. Its notices are
// the success chatter — the tarball listing, the file count — and they are the
// same on every package; the config warnings come from pnpm's environment rather
// than from anything about the package.
const NPM_NOISE = [
  /^npm warn Unknown (env|user) config /,
  /^npm notice/,
  /^npm$/,
];

const npmReport = (output) =>
  dim(
    output
      .split('\n')
      .filter(
        (line) => line !== '' && !NPM_NOISE.some((noise) => noise.test(line)),
      )
      .join('\n'),
  );

const indent = (text, width) =>
  text
    .split('\n')
    .map((line) => `${' '.repeat(width)}${line}`)
    .join('\n');

const publishDirs = process.argv.slice(2).filter((a) => !a.startsWith('-'));
const dryRun = process.argv.includes('--dry-run');

// Truncated up front so that a run with nothing to publish still leaves a readable
// file, rather than making the action report the output as missing.
if (changesetsOutput) fs.writeFileSync(changesetsOutput, '');

const allDirs = [...new Set(findPackageDirs(path.join(rootDir, 'packages')))]
  .map((dir) => ({ dir, manifest: readManifest(dir) }))
  .filter(({ manifest }) => !manifest.private)
  .filter(
    ({ dir, manifest }) =>
      publishDirs.length === 0 ||
      publishDirs.some(
        (target) => manifest.name === target || dir.endsWith(target),
      ),
  );

const ordered = sortTopologically(allDirs);

const startedAt = Date.now();
const total = ordered.length;
const plural = total === 1 ? '' : 's';

const labelOf = ({ manifest }) => `${manifest.name}@${manifest.version}`;
const labelWidth = Math.max(0, ...ordered.map(labelOf).map((l) => l.length));
const counterWidth = `[${total}/${total}]`.length;
// Where the package label starts in a row: two spaces, the counter, one space.
const labelColumn = 2 + counterWidth + 1;
// Sub-lines — a retry notice, a failure's npm report — sit just inside the row
// they belong to, so they read as part of that package rather than as the next
// entry. Kept as arithmetic: `labelColumn + '1'` would concatenate, and
// `repeat(NaN)` silently yields no indent at all.
const detail = labelColumn + 1;

const counter = (index) => dim(`[${index}/${total}]`.padEnd(counterWidth));
const row = (index, label, status) =>
  `  ${counter(index)} ${label.padEnd(labelWidth)}  ${status}`;

console.log(
  `\n${bold(dryRun ? `Would publish ${total} package${plural}` : `Publishing ${total} package${plural}`)}`,
);
console.log(
  dim(
    `  dependencies before dependents · versions already on npm are skipped · an interrupted release resumes by rerunning`,
  ),
);
console.log();

const tally = { published: 0, skipped: 0, planned: 0 };
let failures = 0;

for (const [index, { dir, manifest }] of ordered.entries()) {
  const label = labelOf({ manifest });
  const at = Date.now();
  const elapsed = () => dim(`  ${formatDuration(Date.now() - at)}`);

  const missing = verifyEntryPoints(dir, manifest);

  if (missing.length) {
    console.error(`${row(index + 1, label, red('✗ not built'))}`);
    console.error(
      indent(dim(`entry points missing: ${missing.join(', ')}`), detail),
    );
    console.error(indent(dim('run `pnpm build` first'), detail));
    failures += 1;
    continue;
  }

  if (isPublished(manifest.name, manifest.version)) {
    console.log(`${row(index + 1, label, dim('· already on npm'))}`);
    tally.skipped += 1;
    continue;
  }

  if (dryRun) {
    console.log(`${row(index + 1, label, yellow('would publish'))}`);
    tally.planned += 1;
    continue;
  }

  console.log(`${row(index + 1, label, dim('publishing…'))}`);

  const result = publish(dir, (wait, attempt) => {
    console.log(
      `${' '.repeat(detail)}${yellow(`registry busy, retrying in ${formatDuration(wait)}`)} ${dim(`(${attempt}/${PUBLISH_ATTEMPTS})`)}`,
    );
  });

  if (result.ok) {
    console.log(`${row(index + 1, label, green('✓ published'))}${elapsed()}`);
    tally.published += 1;
    // Recorded only on success: the action turns each line into a tag and a
    // release, and a tag for a version that never reached the registry would
    // point at nothing.
    recordPublished(manifest);
  } else {
    console.error(`${row(index + 1, label, red('✗ failed'))}${elapsed()}`);
    console.error(indent(npmReport(result.output), detail));
    failures += 1;
  }
}

const summary = [
  dryRun ? `${tally.planned} to publish` : `${tally.published} published`,
  tally.skipped > 0 ? `${tally.skipped} already on npm` : null,
  failures > 0 ? `${failures} failed` : null,
]
  .filter(Boolean)
  .join(' · ');

console.log(
  `\n${bold(failures > 0 ? red(summary) : green(summary))}  ${dim(formatDuration(Date.now() - startedAt))}\n`,
);

if (failures > 0) process.exit(1);
