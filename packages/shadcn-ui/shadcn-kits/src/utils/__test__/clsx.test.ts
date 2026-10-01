import { describe, expect, it } from 'vitest';
import { cn } from '../clsx';

describe('cn', () => {
  it('joins class names', () => {
    expect(cn('a', 'b')).toBe('a b');
  });

  it('skips falsy values', () => {
    expect(cn('a', false, undefined, null, '', 'b')).toBe('a b');
  });

  it('reads truthy object keys', () => {
    expect(cn({ a: true, b: false })).toBe('a');
  });

  it('resolves conflicting Tailwind classes in favour of the last', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4');
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
  });

  it('keeps unrelated classes side by side', () => {
    expect(cn('flex items-center', 'p-4')).toBe('flex items-center p-4');
  });

  it('returns an empty string for no input', () => {
    expect(cn()).toBe('');
  });
});
