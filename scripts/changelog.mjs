import { execFileSync } from 'node:child_process';
import { copyFileSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Regenerate CHANGELOG.md from the commit log.
 *
 * `conventional-changelog` only sees commits in *this* repository. When the
 * file already carries releases that predate the current git history, running
 * it with `-r 0` silently rewrites the whole file and drops them — and they are
 * not recoverable, because the history they were generated from is gone.
 *
 * So: only replace the newest release. Older sections are carried over
 * verbatim, and a backup is written before anything changes.
 */

const rootDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);

const changelogPath = path.join(rootDir, 'CHANGELOG.md');
const backupPath = path.join(rootDir, 'CHANGELOG.md.bak');

const exists = () => {
  try {
    return readFileSync(changelogPath, 'utf-8');
  } catch {
    return null;
  }
};

/** The version header at the top of the file, e.g. `## 0.1.0 2026-10-02`. */
const topVersion = (markdown) => {
  const match = markdown.match(/^#{1,2}\s*\[?(\d+\.\d+\.\d+[^\]\s]*)/m);

  return match?.[1] ?? null;
};

const before = exists();

if (!before) {
  console.error('CHANGELOG.md not found.');
  process.exit(1);
}

const previousTop = topVersion(before);

copyFileSync(changelogPath, backupPath);

// `-r 0` walks back through the whole history of this repository only.
execFileSync(
  'npx',
  [
    '--yes',
    'conventional-changelog',
    '-p',
    'angular',
    '-i',
    'CHANGELOG.md',
    '-s',
    '-r',
    '0',
  ],
  { cwd: rootDir, stdio: 'inherit' },
);

execFileSync('node', ['scripts/clean-changelog.mjs'], {
  cwd: rootDir,
  stdio: 'inherit',
});

const after = exists();

if (!after) {
  console.error('Regeneration produced no output; restoring the backup.');
  copyFileSync(backupPath, changelogPath);
  process.exit(1);
}

const newTop = topVersion(after);

// Carry over every release older than the one we just regenerated, so history
// that predates this repository's git history is not lost.
const splitAt = (markdown, version) => {
  if (!version) return null;

  const pattern = new RegExp(
    `^#{1,2}\\s*\\[?${version.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}\\b`,
    'm',
  );
  const match = pattern.exec(markdown);

  return match ? match.index : null;
};

const previousSectionsStart = splitAt(before, previousTop);
const regeneratedSectionsStart = splitAt(after, newTop);

if (
  previousSectionsStart !== null &&
  regeneratedSectionsStart !== null &&
  newTop
) {
  const olderSections = before.slice(previousSectionsStart);
  const regenerated = after.slice(0, regeneratedSectionsStart).trimEnd();

  writeFileSync(changelogPath, `${regenerated}\n\n${olderSections}`, 'utf-8');

  console.log(
    `\nKept ${olderSections.split(/^#{1,2}\s/m).length - 1} older release(s) that predate this repository's git history.`,
  );
}

console.log(`Backup written to CHANGELOG.md.bak`);
