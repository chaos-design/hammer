'use client';

import { cn } from '@chaos-design/shadcn-kits';
import { Monitor, Moon, Sun } from 'lucide-react';
import * as React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from './components/ui/dropdown-menu';
import {
  applyTheme,
  DARK_MEDIA_QUERY,
  DEFAULT_STORAGE_KEY,
  isTheme,
  prefersDark,
  readStoredTheme,
  resolveTheme,
  THEMES,
  type Theme,
  type ThemeAttribute,
  themeScript,
  withoutTransitions,
  writeStoredTheme,
} from './theme';

/**
 * `useLayoutEffect` is a no-op warning during SSR, and running before paint is
 * the whole point here: applying the theme after paint would show one frame of
 * the wrong colours.
 */
const useIsomorphicLayoutEffect =
  typeof document === 'undefined' ? React.useEffect : React.useLayoutEffect;

type ThemeIcon = React.ComponentType<React.SVGProps<SVGSVGElement>>;

const DEFAULT_ICONS: Record<Theme, ThemeIcon> = {
  light: Sun,
  dark: Moon,
  system: Monitor,
};

const DEFAULT_LABELS: Record<Theme, string> = {
  light: 'Light',
  dark: 'Dark',
  system: 'System',
};

/** `localStorage` throws in some privacy modes and is absent while SSR. */
const getStorage = (): Storage | null => {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

const listeners = new Set<(theme: Theme) => void>();

/** Fan a change out to every switch on this page; cross-tab is the `storage` event. */
function emitTheme(theme: Theme) {
  for (const listener of listeners) listener(theme);
}

export interface ThemeSwitchClassNames {
  /** The icon-only button in the page chrome. */
  trigger?: string;
  /** The floating menu. */
  content?: string;
  /** A `Light` / `Dark` / `System` row. */
  item?: string;
  /** The leading icon of a row and of the trigger. */
  icon?: string;
}

export interface ThemeSwitchProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof DropdownMenu>,
    'value' | 'defaultValue' | 'onValueChange'
  > {
  /** Controlled theme. Leave it out to let the component own the state. */
  value?: Theme;
  /** Theme used when nothing is stored yet. @default 'system' */
  defaultTheme?: Theme;
  /** Called whenever the user picks a theme, controlled or not. */
  onValueChange?: (theme: Theme) => void;
  /** Storage key shared by every switch on the page. @default 'theme' */
  storageKey?: string;
  /** Drop `System` for apps that only ship light and dark. @default true */
  enableSystem?: boolean;
  /** How the theme reaches the document root. @default 'class' */
  attribute?: ThemeAttribute;
  /** Kill CSS transitions during the swap. @default true */
  disableTransitionOnChange?: boolean;
  /** Menu text per theme, for i18n. */
  labels?: Partial<Record<Theme, string>>;
  /** Icon per theme. */
  icons?: Partial<Record<Theme, ThemeIcon>>;
  /** Overrides the trigger's generated `aria-label`. */
  triggerLabel?: string;
  className?: string;
  classNames?: ThemeSwitchClassNames;
}

/**
 * A colour theme switch: one square icon button that opens a `Light` / `Dark` /
 * `System` menu, the same shape the Claude docs use.
 *
 * The trigger shows the icon of the selected entry, so it reads as a state
 * rather than as an action. `System` keeps following the OS while it is picked.
 */
export function ThemeSwitch({
  value,
  defaultTheme = 'system',
  onValueChange,
  storageKey = DEFAULT_STORAGE_KEY,
  enableSystem = true,
  attribute = 'class',
  disableTransitionOnChange = true,
  labels,
  icons,
  triggerLabel,
  className,
  classNames,
  ...menuProps
}: ThemeSwitchProps) {
  const [theme, setTheme] = React.useState<Theme>(defaultTheme);

  const entries = enableSystem
    ? THEMES
    : THEMES.filter((item) => item !== 'system');
  const labelOf = (item: Theme) => labels?.[item] ?? DEFAULT_LABELS[item];
  const iconOf = (item: Theme) => icons?.[item] ?? DEFAULT_ICONS[item];

  const commit = React.useCallback(
    (next: Theme) => {
      onValueChange?.(next);

      // Controlled usage: the parent owns the state, so we neither persist nor
      // emit — it can decide that itself if it wants it.
      if (value !== undefined) return;

      writeStoredTheme(getStorage(), storageKey, next);
      setTheme(next);
      // Siblings read the same storage, but not until the next event loop
      // turn; tell them now so two switches never disagree mid-session.
      emitTheme(next);
    },
    [onValueChange, storageKey, value],
  );

  useIsomorphicLayoutEffect(() => {
    const root = document.documentElement;

    // Adopt what is already stored. Deliberately not during render: the
    // server has no storage, and reading it mid-render would desync hydration.
    // A layout effect resolves before the browser paints, so nothing flashes.
    if (value === undefined) {
      const stored = readStoredTheme(getStorage(), storageKey, defaultTheme);
      if (stored !== theme) {
        setTheme(stored);
        return;
      }
    }

    const apply = () => {
      const write = () => {
        const resolved = resolveTheme(value ?? theme, prefersDark());
        applyTheme(resolved, { root, attribute });
      };

      if (disableTransitionOnChange) {
        withoutTransitions(write, { doc: document });
      } else {
        write();
      }
    };

    apply();

    // Only `system` depends on the OS, so this is the only live subscription.
    if ((value ?? theme) !== 'system' || !window.matchMedia) return;
    const media = window.matchMedia(DARK_MEDIA_QUERY);
    media.addEventListener('change', apply);

    return () => media.removeEventListener('change', apply);
  }, [
    attribute,
    defaultTheme,
    disableTransitionOnChange,
    storageKey,
    theme,
    value,
  ]);

  // Mirror updates from the other switches on this page and from other tabs,
  // where the browser reports them through `storage`.
  React.useEffect(() => {
    if (value !== undefined) return;

    const onStored = (next: Theme) => setTheme(next);
    const onStorage = (event: StorageEvent) => {
      // A null key means the whole store was cleared.
      if (event.key !== null && event.key !== storageKey) return;
      setTheme(
        event.newValue === null
          ? defaultTheme
          : isTheme(event.newValue)
            ? event.newValue
            : defaultTheme,
      );
    };

    listeners.add(onStored);
    window.addEventListener('storage', onStorage);

    return () => {
      listeners.delete(onStored);
      window.removeEventListener('storage', onStorage);
    };
  }, [defaultTheme, storageKey, value]);

  const current = value ?? theme;
  const TriggerIcon = iconOf(current);

  return (
    <DropdownMenu {...menuProps}>
      <DropdownMenuTrigger
        aria-label={triggerLabel ?? `Color theme: ${labelOf(current)}`}
        title={triggerLabel ?? `Color theme: ${labelOf(current)}`}
        className={cn(
          'inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-md text-zinc-500 outline-none transition-colors hover:bg-zinc-100 hover:text-zinc-900 focus-visible:ring-1 focus-visible:ring-zinc-950 data-[state=open]:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50 dark:data-[state=open]:bg-zinc-800 dark:focus-visible:ring-zinc-300',
          className,
          classNames?.trigger,
        )}
      >
        <TriggerIcon
          className={cn('size-4', classNames?.icon)}
          aria-hidden="true"
        />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className={classNames?.content}>
        <DropdownMenuRadioGroup
          value={current}
          onValueChange={(next) => commit(next as Theme)}
        >
          {entries.map((entry) => {
            const Icon = iconOf(entry);

            return (
              <DropdownMenuRadioItem
                key={entry}
                value={entry}
                className={classNames?.item}
              >
                <Icon
                  className={cn('size-4 text-zinc-500', classNames?.icon)}
                  aria-hidden="true"
                />
                {labelOf(entry)}
              </DropdownMenuRadioItem>
            );
          })}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export interface ThemeScriptProps
  extends React.ComponentPropsWithoutRef<'script'>,
    ThemeScriptOptionsLike {}

/** The props `themeScript` reads, mirrored so the component can forward them. */
interface ThemeScriptOptionsLike {
  storageKey?: string;
  defaultTheme?: Theme;
  attribute?: ThemeAttribute;
}

/**
 * Emits the blocking no-flash script. Render it on the server, in the head.
 *
 * A client-only render does not run it, which is why the component also applies
 * the theme from a layout effect — this script only removes the visible flash
 * between the first paint and hydration.
 */
export function ThemeScript({
  storageKey,
  defaultTheme,
  attribute,
  ...props
}: ThemeScriptProps) {
  return (
    <script {...props} data-chaos-theme="">
      {themeScript({ storageKey, defaultTheme, attribute })}
    </script>
  );
}
