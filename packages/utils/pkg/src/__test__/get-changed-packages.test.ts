import { test, expect } from 'vitest';
import getChangedPackages, {
  checkFiles,
  uniqueChangedPackages,
} from '../get-changed-packages';
import getPackageInfo from '../get-package';
import { PackageInfo } from '../types';

const pkg = require('../../package.json');

const expectedResult = [
  {
    name: pkg.name,
    version: pkg.version,
  },
];

test('should return changed packages', () => {
  expect(getChangedPackages()).toEqual(expectedResult);
});

test('checkFiles should return package info for each file', () => {
  const files = ['a.txt', 'b.txt', 'node_modules'];

  const packageInfoA = getPackageInfo('a.txt');
  const packageInfoB = getPackageInfo('b.txt');

  const expectedResult = [packageInfoA, packageInfoB].filter(
    (item) => item !== null
  ) as PackageInfo[];

  const result = checkFiles(files);

  expect(result).toEqual(expectedResult);
});

test('uniqueChangedPackages should return unique packages', () => {
  const changedPackages = [
    { name: 'a', version: '1.0.0' },
    { name: 'b', version: '1.0.0' },
    { name: 'a', version: '2.0.0' },
  ];

  const expectedResult = [
    { name: 'a', version: '1.0.0' },
    { name: 'b', version: '1.0.0' },
  ];

  const result = uniqueChangedPackages(changedPackages);

  expect(result).toEqual(expectedResult);
});

test('uniqueChangedPackages should return empty array if input is empty', () => {
  const changedPackages = [];

  const result = uniqueChangedPackages(changedPackages);

  expect(result).toEqual([]);
});

test('uniqueChangedPackages should return array if all packages are unique', () => {
  const changedPackages = [
    { name: 'a', version: '1.0.0' },
    { name: 'b', version: '1.0.0' },
  ];

  const result = uniqueChangedPackages(changedPackages);

  expect(result).toEqual(changedPackages);
});
