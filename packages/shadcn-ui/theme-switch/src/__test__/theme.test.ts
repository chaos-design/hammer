import { describe, expect, it } from 'vitest';
import {
  applyTheme,
  isTheme,
  type ResolvedTheme,
  readStoredTheme,
  resolveTheme,
  themeScript,
  withoutTransitions,
  writeStoredTheme,
} from '../theme';

/** A minimal stand-in for the document root; enough for `applyTheme`. */
const createRoot = () => {
  const classes = new Set<string>();
  const attributes = new Map<string, string>();
  const toggles: Array<[string, boolean]> = [];

  return {
    classes,
    attributes,
    toggles,
    classList: {
      toggle: (name: string, force: boolean) => {
        toggles.push([name, force]);
        if (force) classes.add(name);
        else classes.delete(name);
      },
      remove: (name: string) => {
        classes.delete(name);
      },
      add: (name: string) => {
        classes.add(name);
      },
    },
    setAttribute: (name: string, value: string) => {
      attributes.set(name, value);
    },
    removeAttribute: (name: string) => {
      attributes.delete(name);
    },
    style: {} as { colorScheme?: ResolvedTheme },
  };
};

describe('isTheme', () => {
  it('accepts the three known themes', () => {
    expect(isTheme('light')).toBe(true);
    expect(isTheme('dark')).toBe(true);
    expect(isTheme('system')).toBe(true);
  });

  it('rejects anything else', () => {
    expect(isTheme('Dark')).toBe(false);
    expect(isTheme('')).toBe(false);
    expect(isTheme(null)).toBe(false);
    expect(isTheme(undefined)).toBe(false);
    expect(isTheme(0)).toBe(false);
  });
});

describe('resolveTheme', () => {
  it('passes through explicit themes', () => {
    expect(resolveTheme('light', false)).toBe('light');
    expect(resolveTheme('dark', false)).toBe('dark');
    expect(resolveTheme('dark', true)).toBe('dark');
  });

  it('follows the OS preference for system', () => {
    expect(resolveTheme('system', true)).toBe('dark');
    expect(resolveTheme('system', false)).toBe('light');
  });
});

describe('readStoredTheme', () => {
  it('returns a valid stored theme', () => {
    expect(
      readStoredTheme(
        { getItem: () => 'dark', setItem: () => {} },
        'theme',
        'system',
      ),
    ).toBe('dark');
  });

  it('falls back on a corrupt value', () => {
    expect(
      readStoredTheme(
        { getItem: () => 'solarized', setItem: () => {} },
        'theme',
        'light',
      ),
    ).toBe('light');
  });

  it('falls back when storage is missing or blocked', () => {
    expect(readStoredTheme(null, 'theme', 'system')).toBe('system');
    expect(
      readStoredTheme(
        {
          getItem: () => {
            throw new Error('blocked');
          },
          setItem: () => {},
        },
        'theme',
        'dark',
      ),
    ).toBe('dark');
  });
});

describe('writeStoredTheme', () => {
  it('writes when storage works', () => {
    const written: string[] = [];
    writeStoredTheme(
      { getItem: () => null, setItem: (_, value) => written.push(value) },
      'theme',
      'dark',
    );

    expect(written).toEqual(['dark']);
  });

  it('stays quiet when storage is missing or blocked', () => {
    expect(() => writeStoredTheme(null, 'theme', 'dark')).not.toThrow();
    expect(() =>
      writeStoredTheme(
        {
          getItem: () => null,
          setItem: () => {
            throw new Error('blocked');
          },
        },
        'theme',
        'dark',
      ),
    ).not.toThrow();
  });
});

describe('applyTheme', () => {
  it('toggles the dark class for the class strategy', () => {
    const root = createRoot();

    applyTheme('dark', { root: root as unknown as HTMLElement });
    expect(root.toggles).toEqual([['dark', true]]);
    expect(root.style.colorScheme).toBe('dark');

    applyTheme('light', { root: root as unknown as HTMLElement });
    expect(root.toggles.at(-1)).toEqual(['dark', false]);
    expect(root.style.colorScheme).toBe('light');
  });

  it('clears a stale data-theme while on the class strategy', () => {
    const root = createRoot();
    root.attributes.set('data-theme', 'dark');

    applyTheme('light', { root: root as unknown as HTMLElement });
    expect(root.attributes.has('data-theme')).toBe(false);
  });

  it('writes data-theme and no dark class for the attribute strategy', () => {
    const root = createRoot();
    root.classes.add('dark');

    applyTheme('dark', {
      root: root as unknown as HTMLElement,
      attribute: 'data-theme',
    });

    expect(root.attributes.get('data-theme')).toBe('dark');
    expect(root.classes.has('dark')).toBe(false);
    expect(root.style.colorScheme).toBe('dark');
  });
});

describe('withoutTransitions', () => {
  it('inserts the kill-switch stylesheet and restores on cleanup', () => {
    let removed = false;
    const appended: Array<{ textContent: string; remove: () => void }> = [];
    const doc = {
      createElement: () => ({
        textContent: '',
        remove: () => {
          removed = true;
        },
      }),
      head: { appendChild: (node: unknown) => appended.push(node as never) },
    } as unknown as Document;

    const result = withoutTransitions(() => 42, {
      doc,
      schedule: (cleanup) => cleanup(),
    });

    expect(result).toBe(42);
    expect(appended).toHaveLength(1);
    expect(appended[0].textContent).toContain('transition:none');
    expect(removed).toBe(true);
  });

  it('restores transitions even when the work throws', () => {
    let removed = false;
    const doc = {
      createElement: () => ({
        textContent: '',
        remove: () => {
          removed = true;
        },
      }),
      head: { appendChild: () => {} },
    } as unknown as Document;

    expect(() =>
      withoutTransitions(
        () => {
          throw new Error('boom');
        },
        {
          doc,
          schedule: (cleanup) => cleanup(),
        },
      ),
    ).toThrow('boom');
    expect(removed).toBe(true);
  });
});

describe('themeScript', () => {
  const run = (
    code: string,
    ctx: { stored: string | null; prefersDark: boolean },
  ) => {
    const classes = new Set<string>();
    const attributes = new Map<string, string>();
    const togglesMade: Array<[string, boolean]> = [];

    const fakeRoot = {
      classList: {
        toggle: (name: string, force: boolean) => {
          togglesMade.push([name, force]);
          if (force) classes.add(name);
          else classes.delete(name);
        },
      },
      setAttribute: (name: string, value: string) => {
        attributes.set(name, value);
      },
      style: {} as { colorScheme?: string },
    };

    const fakeDocument = { documentElement: fakeRoot };
    const fakeWindow = {
      matchMedia: () => ({ matches: ctx.prefersDark }),
    };
    const localStorage = { getItem: () => ctx.stored };

    // The generated code reads `window`, `document` and `localStorage` as free
    // identifiers; passing them as parameters shadows the real globals.
    new Function('window', 'document', 'localStorage', code)(
      fakeWindow,
      fakeDocument,
      localStorage,
    );

    return { classes, attributes, togglesMade, style: fakeRoot.style };
  };

  it('applies a stored dark theme before paint', () => {
    const { togglesMade, style } = run(themeScript(), {
      stored: 'dark',
      prefersDark: false,
    });

    expect(togglesMade).toEqual([['dark', true]]);
    expect(style.colorScheme).toBe('dark');
  });

  it('resolves system from the media query', () => {
    expect(
      run(themeScript(), { stored: 'system', prefersDark: true }).togglesMade,
    ).toEqual([['dark', true]]);
    expect(
      run(themeScript(), { stored: 'system', prefersDark: false }).togglesMade,
    ).toEqual([['dark', false]]);
  });

  it('falls back to the default theme when the stored value is unknown', () => {
    expect(() =>
      run(themeScript(), { stored: 'bogus', prefersDark: false }),
    ).not.toThrow();
    expect(
      run(themeScript(), { stored: null, prefersDark: true }).togglesMade,
    ).toEqual([['dark', true]]);
  });

  it('supports the data-theme strategy', () => {
    const { attributes } = run(themeScript({ attribute: 'data-theme' }), {
      stored: 'dark',
      prefersDark: false,
    });

    expect(attributes.get('data-theme')).toBe('dark');
  });

  it('embeds a custom storage key', () => {
    expect(themeScript({ storageKey: 'ui-theme' })).toContain('ui-theme');
  });
});
