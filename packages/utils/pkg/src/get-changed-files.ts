import { execSync } from 'node:child_process';

const getChangedFiles = (commitId = 'HEAD^1') => {
  const changedFiles: string[] = execSync(`git diff ${commitId} --name-only`)
    .toString()
    .split('\n')
    .filter(Boolean);

  return changedFiles;
};

export default getChangedFiles;
