import type { Language } from './i18n';

/**
 * Locale routing helpers for the docs site.
 *
 * The site is served from two physical route trees:
 *
 *   - Chinese (the default language) is **unprefixed**:  `/docs/guides`
 *   - English is prefixed:                              `/en/docs/guides`
 *
 * This matches the Fumadocs i18n config `hideLocale: 'default-locale'`, where
 * the default language's URLs carry no locale segment. The built-in
 * `I18nProvider.onLocaleChange` assumes `hideLocale: 'never'` (it always puts a
 * locale as the first segment), so it would produce the wrong URL when leaving
 * English back to the default. These helpers implement the `default-locale`
 * behaviour instead.
 *
 * All paths here are basePath-less: `usePathname()` returns the path without
 * the Next.js `basePath`, and `router.push` re-applies it. Callers must not
 * pre-apply `withBasePath` to the values returned by {@link switchLocale}.
 */

/** The prefix segment used for every non-default locale. */
function localePrefix(locale: Language): string | undefined {
  // 'zh' is the default and is hidden; every other locale is prefixed.
  return locale === 'zh' ? undefined : locale;
}

/**
 * Detect the locale of a basePath-less pathname. A leading `en` segment means
 * English; anything else (including no leading locale) is the default `zh`.
 */
export function detectLocale(pathname: string): Language {
  const first = pathname.split('/').filter(Boolean)[0];
  return first === 'en' ? 'en' : 'zh';
}

/**
 * Compute the target pathname (basePath-less) for `pathname` switched to
 * `target` under `hideLocale: 'default-locale'`.
 *
 * Examples:
 *   switchLocale('/docs/guides', 'en')      -> '/en/docs/guides'
 *   switchLocale('/en/docs/guides', 'zh')   -> '/docs/guides'
 *   switchLocale('/', 'en')                  -> '/en'
 */
export function switchLocale(pathname: string, target: Language): string {
  const segments = pathname.split('/').filter(Boolean);
  const current = detectLocale(pathname);
  const prefix = localePrefix(current);

  // Strip the current locale prefix, if any.
  const rest = prefix !== undefined ? segments.slice(1) : segments;

  const nextPrefix = localePrefix(target);
  const next = nextPrefix !== undefined ? [nextPrefix, ...rest] : rest;

  return `/${next.join('/')}`;
}
