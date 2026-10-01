import * as path from 'node:path';
import { describe, expect, test } from 'vitest';
import getPackageInfo from '../get-package';

describe('getPackageInfo', () => {
  test('returns the package that owns the given file', () => {
    const result = getPackageInfo('./package.json');

    expect(result).toEqual({
      name: '@chaos-design/utils-pkg',
      version: expect.any(String),
      path: path.resolve('package.json'),
    });
  });

  test('returns null for a file that does not exist', () => {
    expect(getPackageInfo('/path/to/nonexistent/file')).toBeNull();
  });

  test('walks up to find the owning package.json', () => {
    const result = getPackageInfo('src/index.ts');

    expect(result?.name).toBe('@chaos-design/utils-pkg');
    expect(result?.path.endsWith('package.json')).toBe(true);
  });

  test('returns null for a path that is not a file', () => {
    expect(getPackageInfo('.')).toBeNull();
  });
});
