import { execFileSync } from 'node:child_process';

/**
 * List the files changed by a commit.
 *
 * @param commitId A commit-ish to diff against, e.g. `HEAD^1`.
 * @param cwd Repository root. Defaults to the current working directory.
 */
const getChangedFiles = (
  commitId = 'HEAD^1',
  cwd = process.cwd(),
): string[] => {
  try {
    // `execFileSync` keeps the commit ref out of a shell command string.
    const stdout = execFileSync('git', ['diff', commitId, '--name-only'], {
      cwd,
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    return stdout.split('\n').filter(Boolean);
  } catch {
    // Not a git repository, or the commit does not exist.
    return [];
  }
};

export default getChangedFiles;
