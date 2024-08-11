import * as path from 'node:path';
import { expect, test } from 'vitest';

import getPackageInfo from '../get-package';

const packageJson = {
  name: '@chaos-design/utils-pkg',
  path: 'package.json',
  version: '0.0.19-beta.19',
};

const filePath = './package.json';

test('getPackageInfo should return package info when file exists', () => {
  const result = getPackageInfo(filePath);
  console.log('filePath', result, filePath, path.dirname(filePath));

  expect(result).toEqual(packageJson);
});

test('getPackageInfo should return null when file does not exist', () => {
  const result = getPackageInfo('/path/to/nonexistent/file');

  expect(result).toBeNull();
});
