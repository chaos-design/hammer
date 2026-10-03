import { defineI18n } from 'fumadocs-core/i18n';

/**
 * Fumadocs i18n configuration for the Hammer docs site.
 *
 * - `zh` is the default (primary) language. With `hideLocale: 'default-locale'`
 *   its URLs carry **no** prefix (e.g. `/docs/guides/installation`), which keeps
 *   the GitHub Pages static-export layout and the CI assertions that hardcode
 *   those unprefixed paths working.
 * - `en` is served under the `/en` prefix (e.g. `/en/docs/guides/installation`).
 *
 * The static-export (GitHub Pages) deployment cannot run a middleware, so locale
 * routing is handled by the App Router segments (`/en/...` vs `/...`) and the
 * custom `LanguageSwitcher` (see `utils/locale-copy.ts`). No `createI18nMiddleware`.
 */
export const i18n = defineI18n({
  defaultLanguage: 'zh',
  languages: ['zh', 'en'],
  hideLocale: 'default-locale',
});

export type Language = 'zh' | 'en';
