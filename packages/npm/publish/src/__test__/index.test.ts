import { describe, expect, test } from 'vitest';
import { resolvePublishPackages } from '../index';

const cwd = process.cwd();

describe('resolvePublishPackages', () => {
  test('puts dependencies before the packages that need them', async () => {
    const names = await resolvePublishPackages(['@chaos-design/calendar'], {
      cwd,
      ignore: ['**/node_modules/**'],
      onlyDependencies: true,
    });

    expect(names).toContain('@chaos-design/calendar');
    expect(names).toContain('@chaos-design/shadcn-kits');

    const kits = names.indexOf('@chaos-design/shadcn-kits');
    const calendar = names.indexOf('@chaos-design/calendar');

    expect(kits).toBeLessThan(calendar);
  });

  test('includes peerDependencies as publish blockers by default', async () => {
    const names = await resolvePublishPackages(['@chaos-design/color-picker'], {
      cwd,
      ignore: ['**/node_modules/**'],
      onlyDependencies: true,
    });

    expect(names).toContain('@chaos-design/color-picker');
    expect(names).toContain('@chaos-design/shadcn-kits');
  });

  test('returns a single package with no workspace dependencies', async () => {
    const names = await resolvePublishPackages(['@chaos-design/task'], {
      cwd,
      ignore: ['**/node_modules/**'],
      onlyDependencies: true,
    });

    expect(names).toEqual(['@chaos-design/task']);
  });

  test('returns an empty list when nothing matches', async () => {
    const names = await resolvePublishPackages(['nope'], {
      cwd,
      ignore: ['**/node_modules/**'],
      onlyDependencies: true,
    });

    expect(names).toEqual([]);
  });
});
