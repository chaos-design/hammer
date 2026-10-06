# @chaos-design/theme-switch

[简体中文](./README.zh-CN.md)

A colour theme switch for shadcn/ui apps: one square icon button that opens a
`Light` / `Dark` / `System` menu, the same shape the Claude docs use. Built with
React, Tailwind CSS, Radix and [lucide-react](https://lucide.dev).

## Installation

```bash
npm install @chaos-design/theme-switch
# or
pnpm add @chaos-design/theme-switch
```

`react` and `react-dom` (18 or 19) are peer dependencies. `@radix-ui/react-dropdown-menu`, `lucide-react`, `clsx` and `tailwind-merge` are regular dependencies; the build leaves them external, so the package ships only its own code (~2.8 KB gzipped JS, ~1.5 KB gzipped CSS).

### Import styles

```tsx
import '@chaos-design/theme-switch/dist/es/index.css';
```

The stylesheet contains only Tailwind *utilities* — no preflight — so importing it never resets your app's global styles.

## Usage

```tsx
import * as React from 'react';
import { ThemeSwitch } from '@chaos-design/theme-switch';

export function ThemeSwitchDemo() {
  return <ThemeSwitch />;
}
```

Uncontrolled, the switch persists its choice to `localStorage` and applies it to
`document.documentElement` (`.dark` class plus `color-scheme`). While `System`
is selected it follows the OS theme live.

### Avoid the first-paint flash

Render the blocking script on the server, before any content:

```tsx
import { ThemeScript } from '@chaos-design/theme-switch';

export function Root() {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body>...</body>
    </html>
  );
}
```

`ThemeScript` only emits a sub-300-byte inline script that mirrors the storage
key, default theme and attribute strategy of the component. A client-only render
does not run it; the component then applies the theme in a layout effect, which
costs at most one unpainted frame.

```ts
// Or generate the script yourself, e.g. in a plain HTML template:
import { themeScript } from '@chaos-design/theme-switch';
const code = themeScript({ storageKey: 'theme', defaultTheme: 'system' });
```

### Controlled usage

```tsx
const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');

<ThemeSwitch value={theme} onValueChange={setTheme} />
```

When `value` is provided the component still applies the theme (it is a UI
control, not just state), but it leaves persistence and sibling sync to the
parent.

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `value` | `'light' \| 'dark' \| 'system'` | — | Controlled theme. |
| `defaultTheme` | `Theme` | `'system'` | Theme used when nothing is stored. |
| `onValueChange` | `(theme: Theme) => void` | — | Called when the user picks a theme. |
| `storageKey` | `string` | `'theme'` | `localStorage` key shared by every switch on the page. |
| `enableSystem` | `boolean` | `true` | Offer the `System` entry for apps that only ship light/dark. |
| `attribute` | `'class' \| 'data-theme'` | `'class'` | How the theme reaches the document root. |
| `disableTransitionOnChange` | `boolean` | `true` | Kill CSS transitions during the swap. |
| `labels` | `Partial<Record<Theme, string>>` | — | Menu text per theme, for i18n. |
| `icons` | `Partial<Record<Theme, ComponentType>>` | — | Icon per theme (defaults to lucide `Sun`/`Moon`/`Monitor`). |
| `triggerLabel` | `string` | — | Overrides the trigger `aria-label` (default `Color theme: <label>`). |
| `className` | `string` | — | Class on the trigger. |
| `classNames` | `ThemeSwitchClassNames` | — | Per-slot class overrides. |

### `classNames`

| Key | Targets |
| --- | ------- |
| `trigger` | Icon-only trigger button |
| `content` | Floating menu |
| `item` | A `Light` / `Dark` / `System` row |
| `icon` | The leading icon of a row and of the trigger |

## Behaviour notes

- **Icon shows state.** The trigger shows the selected entry's icon, and its
  `aria-label` reads `Color theme: System`, mirroring the Claude docs.
- **`System` stays live.** While selected, a media-query listener re-applies the
  theme when the OS flips; the listener is detached as soon as an explicit
  theme is picked, so there is no idle work.
- **Many switches stay in sync.** All switches on a page and every open tab
  track the same `storage` slot; storage writes are canonical.
- **No flash, no smear.** `ThemeScript` sets the theme pre-paint, and
  `disableTransitionOnChange` temporarily disables CSS transitions so the swap
  looks instant rather than like an animation.
- **Storage may be unavailable.** In private mode `localStorage` throws; the
  component catches it and keeps working for the session (it just cannot
  persist).

## License

[MIT](../../../LICENSE)
