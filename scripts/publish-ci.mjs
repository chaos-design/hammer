import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const ignore = ['node_modules', 'dist', 'lib', 'coverage', '__test__'];

function getPackages(dir) {
  let results = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    if (ignore.includes(item) || item.startsWith('.')) continue;

    const itemPath = path.join(dir, item);
    const stat = fs.statSync(itemPath);

    if (stat.isDirectory()) {
      results = results.concat(getPackages(itemPath));
    } else if (item === 'package.json') {
      results.push(dir);
    }
  }
  return results;
}

const packagesDir = path.join(rootDir, 'packages');
const packagePaths = [...new Set(getPackages(packagesDir))];

console.log(`Found ${packagePaths.length} packages to check.`);

for (const pkgPath of packagePaths) {
  const pkgJsonPath = path.join(pkgPath, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8'));

  if (pkg.private) {
    console.log(`Skipping private package: ${pkg.name}`);
    continue;
  }

  console.log(`Checking ${pkg.name}@${pkg.version}...`);

  let alreadyPublished = false;
  try {
    const remoteVersion = execSync(
      `npm view ${pkg.name}@${pkg.version} version`,
      {
        stdio: 'pipe',
        encoding: 'utf-8',
      },
    ).trim();

    if (remoteVersion === pkg.version) {
      alreadyPublished = true;
    }
  } catch (error) {
    // 404 or other error means likely not published
  }

  if (alreadyPublished) {
    console.log(`  Already published. Skipping publish.`);
    continue;
  }

  try {
    console.log(`  Publishing ${pkg.name}...`);
    execSync('pnpm publish --access public --no-git-checks', {
      cwd: pkgPath,
      stdio: 'inherit',
    });
    console.log(`  Successfully published ${pkg.name}@${pkg.version}`);
  } catch (e) {
    console.error(`  Failed to publish ${pkg.name}:`, e.message);
    process.exit(1);
  }
}
