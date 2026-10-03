import { type InferPageType, loader } from 'fumadocs-core/source';
import { lucideIconsPlugin } from 'fumadocs-core/source/lucide-icons';
import type { Metadata } from 'next';
import { docs } from '@/.source';
import { siteConfig } from './config';
import { i18n, type Language } from './i18n';
import { getModificationLabel, isRecentlyModified } from './recent-modified';

// See https://fumadocs.dev/docs/headless/source-api for more info.
//
// i18n is enabled so each language builds its own page tree. `zh` is the
// default and, with `hideLocale: 'default-locale'`, its URLs carry no locale
// prefix; `en` is served under `/en`. Enabling i18n makes the per-accessor
// signatures language-aware, so the *default* language must be passed
// explicitly to keep the historical, unprefixed Chinese URLs working.
export const source = loader({
  i18n,
  baseUrl: '/docs',
  source: docs.toFumadocsSource(),
  plugins: [lucideIconsPlugin()],
});

export type SourcePage = InferPageType<typeof source>;
export const defaultLanguage: Language = i18n.defaultLanguage;

/**
 * Metadata locale identifiers per language.
 *
 * `openGraph` wants the region-qualified `language_REGION` form, while
 * `hreflang` wants a bare language tag: `en` targets English readers
 * everywhere, whereas `en-US` would exclude everyone else.
 */
export const metadataLocales: Record<
  Language,
  { og: string; hreflang: string }
> = {
  zh: { og: 'zh_CN', hreflang: 'zh-CN' },
  en: { og: 'en_US', hreflang: 'en' },
};

/**
 * `hreflang` alternates tying one documentation page to its counterpart in
 * every other language, plus the page's own canonical URL.
 *
 * Both language trees share content slugs, so a counterpart is just a
 * `getPage` on the same slugs in another language. A language is advertised
 * only when it actually has a page: pointing `hreflang` at a 404 makes a
 * crawler drop *all* alternates of the group.
 *
 * Each language canonicalises to *itself* — `hreflang` groups translations,
 * `rel=canonical` picks the primary one, and picking the Chinese URL as the
 * canonical for the English page would deindex English entirely.
 */
export function getLocaleAlternates(page: SourcePage): Metadata['alternates'] {
  const languages: Record<string, string> = {};

  for (const language of i18n.languages) {
    const counterpart = source.getPage(page.slugs, language);
    if (counterpart) {
      languages[metadataLocales[language].hreflang] = counterpart.url;
    }
  }

  return { canonical: page.url, languages };
}

export function getPageImage(page: SourcePage) {
  // Prefix a non-default locale so Chinese and English pages get distinct OG
  // image files (they share content slugs). The default (Chinese) locale is
  // unprefixed, matching `hideLocale: 'default-locale'`.
  const localePrefix =
    page.locale && page.locale !== defaultLanguage ? [page.locale] : [];

  const segments = [...localePrefix, ...page.slugs, 'image.png'];

  return {
    segments,
    // Root-relative on purpose. Next resolves metadata URLs with
    // `path.join(metadataBase.pathname, url)`, so this must NOT carry the
    // basePath or it is applied twice. Call sites that need an `href`/`src`
    // use `withBasePath` instead.
    url: `/og/docs/${segments.join('/')}`,
  };
}

export async function getLLMText(page: SourcePage) {
  const processed = await page.data.getText('processed');

  return `# ${page.data.title} (${page.url})

${processed}`;
}

/**
 * Check if a page is recently modified based on configured threshold
 */
export function isPageRecentlyModified(page: SourcePage): boolean {
  const lastModified = (page.data as { lastModified?: number }).lastModified;
  return isRecentlyModified(lastModified, siteConfig.recentModifiedThreshold);
}

/**
 * Get all recently modified page URLs for quick lookup in sidebar.
 *
 * Scoped to a single language (defaults to the Chinese tree) so each route
 * tree labels only its own pages.
 */
export function getRecentlyModifiedPages(
  language: Language = defaultLanguage,
): Set<string> {
  const recentPages = new Set<string>();

  for (const page of source.getPages(language)) {
    if (isPageRecentlyModified(page)) {
      recentPages.add(page.url);
    }
  }

  return recentPages;
}

/**
 * Get recently modified pages with their modification labels.
 *
 * Returns a plain object (not Map) for proper serialization to client
 * components. Scoped to a single language so the sidebar only labels pages
 * from the tree it is rendered in.
 */
export function getRecentlyModifiedPagesWithLabels(
  language: Language = defaultLanguage,
): Record<string, string> {
  const recentPagesMap: Record<string, string> = {};

  for (const page of source.getPages(language)) {
    if (isPageRecentlyModified(page)) {
      const lastModified = (page.data as { lastModified?: number })
        .lastModified;
      if (lastModified) {
        recentPagesMap[page.url] = getModificationLabel(lastModified);
      } else {
        recentPagesMap[page.url] = 'Recently updated';
      }
    }
  }

  return recentPagesMap;
}
