/**
 * Theme resolution and DOM application.
 *
 * Kept free of React and of module state so the same code can run in three
 * places: inside a component, inside a unit test, and inside the blocking
 * script `themeScript` emits for the document head.
 */

export const THEMES = ['light', 'dark', 'system'] as const;

export type Theme = (typeof THEMES)[number];

/** What `system` collapses to once the OS preference is known. */
export type ResolvedTheme = Exclude<Theme, 'system'>;

/** How the theme is written to the document root: a class, or an attribute. */
export type ThemeAttribute = 'class' | 'data-theme';

export const DEFAULT_STORAGE_KEY = 'theme';
export const DARK_MEDIA_QUERY = '(prefers-color-scheme: dark)';

/** The slice of `Storage` this module needs; `null` disables persistence. */
export interface ThemeStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export function isTheme(value: unknown): value is Theme {
  return THEMES.includes(value as Theme);
}

/** Whether the OS asks for a dark UI. Pass `false` when unknown. */
export function prefersDark(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia(DARK_MEDIA_QUERY).matches;
}

export function resolveTheme(
  theme: Theme,
  prefersDark: boolean,
): ResolvedTheme {
  if (theme !== 'system') return theme;
  return prefersDark ? 'dark' : 'light';
}

/**
 * Read the persisted theme, falling back when it is missing or corrupt.
 *
 * `localStorage` is unavailable while server rendering and throws outright in
 * some privacy modes, so both the missing object and the throw are expected.
 */
export function readStoredTheme(
  storage: ThemeStorage | null,
  storageKey: string,
  fallback: Theme,
): Theme {
  try {
    const stored = storage?.getItem(storageKey);
    return isTheme(stored) ? stored : fallback;
  } catch {
    return fallback;
  }
}

export function writeStoredTheme(
  storage: ThemeStorage | null,
  storageKey: string,
  theme: Theme,
): void {
  try {
    storage?.setItem(storageKey, theme);
  } catch {
    // Nothing to do: the DOM is already themed, it just will not be remembered.
  }
}

export interface ApplyThemeOptions {
  /** Usually `document.documentElement`. */
  root: HTMLElement;
  attribute?: ThemeAttribute;
}

/**
 * Write the resolved theme onto the document root.
 *
 * Both strategies are cleaned up on every call, so switching between them —
 * or between apps that disagree — never leaves a stale marker behind.
 */
export function applyTheme(
  resolved: ResolvedTheme,
  { root, attribute = 'class' }: ApplyThemeOptions,
): void {
  if (attribute === 'data-theme') {
    root.setAttribute('data-theme', resolved);
    root.classList.remove('dark');
  } else {
    root.classList.toggle('dark', resolved === 'dark');
    root.removeAttribute('data-theme');
  }

  // Lets the UA style scrollbars, form controls and the canvas to match.
  root.style.colorScheme = resolved;
}

export interface WithoutTransitionsContext {
  /** Document the temporary stylesheet is appended to. */
  doc: Document;
  /** Runs the cleanup once the browser has been given a frame to settle. */
  schedule?: (cleanup: () => void) => void;
}

/** Clean up after the next macrotask and the following animation frame. */
const defaultSchedule = (cleanup: () => void) => {
  const nextFrame = (run: () => void) => {
    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(run);
    } else {
      setTimeout(run, 16);
    }
  };

  setTimeout(() => nextFrame(cleanup), 0);
};

/**
 * Run `run` with CSS transitions disabled, then restore them.
 *
 * Without this a theme switch animates every `transition-colors` on the page,
 * which reads as a slow smear instead of an instant flip.
 */
export function withoutTransitions<T>(
  run: () => T,
  { doc, schedule = defaultSchedule }: WithoutTransitionsContext,
): T {
  const style = doc.createElement('style');
  style.textContent =
    '*,*::before,*::after{transition:none!important;animation-duration:0s!important;scroll-behavior:auto!important}';
  doc.head.appendChild(style);

  try {
    return run();
  } finally {
    schedule(() => style.remove());
  }
}

export interface ThemeScriptOptions {
  /** Matches the component's `storageKey`. @default 'theme' */
  storageKey?: string;
  /** Used when nothing is stored yet. @default 'system' */
  defaultTheme?: Theme;
  /** Matches the component's `attribute`. @default 'class' */
  attribute?: ThemeAttribute;
}

/**
 * A blocking script that applies the stored theme before the first paint.
 *
 * Render it on the server (Next.js `app/layout.tsx`, or the template's head).
 * A client-only render never executes it — React does not run scripts it mounts
 * on the client — so the component falls back to applying the theme in a
 * layout effect, which costs one unpainted frame.
 *
 * Keeps the `system` preference in storage instead of the resolved theme, so
 * the UI can still show which entry is selected.
 */
export function themeScript({
  storageKey = DEFAULT_STORAGE_KEY,
  defaultTheme = 'system',
  attribute = 'class',
}: ThemeScriptOptions = {}): string {
  const key = JSON.stringify(storageKey);
  const fallback = JSON.stringify(defaultTheme);
  const strategy = JSON.stringify(attribute);
  const query = JSON.stringify(DARK_MEDIA_QUERY);

  // Minified by hand: this string ships in the document head of every page.
  return `(function(){try{var s=localStorage.getItem(${key})||${fallback},m=s==="dark"||(s!=="light"&&window.matchMedia(${query}).matches),r=document.documentElement;${strategy}==="data-theme"?r.setAttribute("data-theme",m?"dark":"light"):r.classList.toggle("dark",m);r.style.colorScheme=m?"dark":"light"}catch(_){}})();`;
}
