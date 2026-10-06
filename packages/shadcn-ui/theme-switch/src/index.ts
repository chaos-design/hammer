'use client';

import './index.css';

export {
  applyTheme,
  DARK_MEDIA_QUERY,
  DEFAULT_STORAGE_KEY,
  isTheme,
  prefersDark,
  type ResolvedTheme,
  readStoredTheme,
  resolveTheme,
  THEMES,
  type Theme,
  type ThemeAttribute,
  type ThemeStorage,
  themeScript,
  withoutTransitions,
  writeStoredTheme,
} from './theme';
export {
  ThemeScript,
  type ThemeScriptProps,
  ThemeSwitch,
  type ThemeSwitchClassNames,
  type ThemeSwitchProps,
} from './theme-switch';
