// eslint-disable-next-line import/no-nodejs-modules
import { execSync } from 'child_process';
import { $, chalk, fs } from 'zx';

// eslint-disable-next-line no-undef
const { getChangedPackages } = require('@chaos-design/utils-pkg');
const changedPackages = getChangedPackages();

const { version } = await fs.readJSON('package.json');
const changed = changedPackages.map((c) => c.path).join(' ');
const bv_cmd = `bumpp -r ${changed} --quiet`;

await fs.writeFileSync('version', version);

console.log(`execSync ${bv_cmd}`);

execSync(bv_cmd, { stdio: 'inherit' });

await fs.ensureFile('CHANGELOG.md');

let newChangelog = '';

try {
  const gitRes = await $`git log --pretty=format:"- %s" "main"...HEAD`;
  newChangelog = gitRes.stdout.trim();
} catch {
  console.error(
    chalk.redBright('Could not get git log, please write changelog manually.'),
  );
}

const now = new Date();
const currentDate = `${now.getFullYear()}-${
  now.getMonth() + 1
}-${now.getDate()}`;
const title = `## ${version} (${currentDate})`;

await fs.ensureFile('CHANGELOG.md');
const oldChangelog = await fs.readFile('CHANGELOG.md', 'utf8');
const changelog = [title, newChangelog, oldChangelog]
  .filter((item) => !!item)
  .join('\n\n');

await fs.writeFile('CHANGELOG.md', changelog);

console.log(
  `\nNow you can make adjustments to ${chalk.cyan(
    'CHANGELOG.md',
  )}. Then press enter to continue.`,
);

process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.on('data', process.exit.bind(process, 0));
