import { describe, expect, test } from 'vitest';
import classnames, { prefix } from '../index';

describe('classnames', () => {
  test('joins strings', () => {
    expect(classnames('a', 'b')).toBe('a b');
  });

  test('ignores falsy values that cannot be class names', () => {
    expect(classnames('a', false, null, undefined, '', Number.NaN, 'b')).toBe(
      'a b',
    );
  });

  test('keeps zero as a class name', () => {
    expect(classnames('a', 0)).toBe('a 0');
  });

  test('flattens nested arrays', () => {
    expect(classnames(['a', ['b', ['c']]])).toBe('a b c');
  });

  test('reads truthy keys of an object', () => {
    expect(classnames({ a: true, b: false, c: 1 })).toBe('a c');
  });

  test('uses a custom toString', () => {
    class Color {
      toString() {
        return 'text-red-500';
      }
    }

    expect(classnames(new Color())).toBe('text-red-500');
  });

  test('ignores inherited object keys', () => {
    const parent = { inherited: true };

    expect(
      classnames(Object.assign(Object.create(parent), { own: true })),
    ).toBe('own');
  });

  test('returns an empty string for no arguments', () => {
    expect(classnames()).toBe('');
  });
});

describe('prefix', () => {
  test('prepends the prefix to every class', () => {
    expect(prefix('x-')('a', 'b')).toBe('x-a x-b');
  });

  test('is idempotent for classes already carrying the prefix', () => {
    expect(prefix('x-')('x-a', 'b')).toBe('x-a x-b');
  });

  test('prefixes only the leading segment, not a substring match', () => {
    // `includes` would wrongly match "px-2" for the prefix "p-".
    expect(prefix('p-')('px-2')).toBe('p-px-2');
  });

  test('applies the prefix to nested arrays and object keys', () => {
    expect(prefix('x-')(['a'], { b: true })).toBe('x-a x-b');
  });

  test('an empty prefix changes nothing', () => {
    expect(prefix()('a', 'b')).toBe('a b');
  });
});
