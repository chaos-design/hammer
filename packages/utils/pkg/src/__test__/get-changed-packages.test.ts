import { describe, expect, test } from 'vitest';
import getChangedPackages, {
  checkFiles,
  uniqueChangedPackages,
} from '../get-changed-packages';
import type { PackageInfo } from '../types';

describe('checkFiles', () => {
  test('maps each file to its owning package', () => {
    const result = checkFiles(['src/index.ts', 'src/types.ts']);

    expect(result).toHaveLength(2);
    for (const info of result) {
      expect(info.name).toBe('@chaos-design/utils-pkg');
    }
  });

  test('skips files that belong to no package', () => {
    expect(checkFiles(['/definitely/not/here/file.ts'])).toEqual([]);
  });

  test('skips files matching an ignore pattern', () => {
    const files = ['src/index.ts'];

    expect(checkFiles(files)).toHaveLength(1);
    expect(checkFiles(files, [/^src\//])).toEqual([]);
  });

  test('accepts a string pattern as well as a regex', () => {
    expect(checkFiles(['src/index.ts'], ['^src/'])).toEqual([]);
  });
});

describe('uniqueChangedPackages', () => {
  test('keeps the first occurrence of each package', () => {
    const changedPackages: PackageInfo[] = [
      { name: 'a', version: '1.0.0', path: '/a/package.json' },
      { name: 'b', version: '1.0.0', path: '/b/package.json' },
      { name: 'a', version: '2.0.0', path: '/a/package.json' },
    ];

    expect(uniqueChangedPackages(changedPackages)).toEqual([
      { name: 'a', version: '1.0.0', path: '/a/package.json' },
      { name: 'b', version: '1.0.0', path: '/b/package.json' },
    ]);
  });

  test('returns an empty array for an empty input', () => {
    expect(uniqueChangedPackages([])).toEqual([]);
  });

  test('preserves order when all packages are unique', () => {
    const changedPackages: PackageInfo[] = [
      { name: 'a', version: '1.0.0', path: '/a/package.json' },
      { name: 'b', version: '1.0.0', path: '/b/package.json' },
    ];

    expect(uniqueChangedPackages(changedPackages)).toEqual(changedPackages);
  });
});

describe('getChangedPackages', () => {
  test('resolves to an array of unique packages', () => {
    // Depends on the surrounding git repository; assert the contract only.
    const result = getChangedPackages();

    expect(Array.isArray(result)).toBe(true);

    for (const info of result) {
      expect(typeof info.name).toBe('string');
      expect(typeof info.version).toBe('string');
      expect(info.path.endsWith('package.json')).toBe(true);
    }
  });
});
