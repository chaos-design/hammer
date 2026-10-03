import type { Language } from '@docs/utils/i18n';
import { landingStrings } from '@docs/utils/locales';
import { metadataLocales } from '@docs/utils/source';
import { RootProvider } from 'fumadocs-ui/provider/next';
import type { Metadata } from 'next';
import { siteConfig } from '@/fumadocs.config';
import './global.css';
import { inter, poppins } from './fonts';

/**
 * The document shell, shared by one root layout per language.
 *
 * Next allows several root layouts as long as there is no `app/layout.tsx`,
 * and that is the only way to get `<html lang>` right: the element is emitted
 * once, by the layout that owns the subtree, so the language can be decided on
 * the server. A client-side patch — setting `documentElement.lang` after
 * hydration — ships the wrong language in the HTML every crawler and every
 * no-JS reader sees, and fixes it only after the page is already parsed.
 *
 * The cost is that navigating between two root layouts is a full page load
 * rather than a client transition. That is exactly the language switch, which
 * should reload anyway, and nothing else crosses the boundary: each group
 * holds a whole language.
 */
export function DocumentShell({
  language,
  children,
}: {
  language: Language;
  children: React.ReactNode;
}) {
  // A BCP 47 tag for the document, not the i18n key: `zh` is not a language
  // tag a screen reader or a hyphenation dictionary recognises.
  const documentLanguage = language === 'zh' ? 'zh-CN' : 'en';

  return (
    <html
      className={`${inter.className} ${inter.variable} ${poppins.variable}`}
      lang={documentLanguage}
      suppressHydrationWarning
    >
      <body className="flex min-h-screen flex-col">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}

/**
 * Metadata every page starts from.
 *
 * Each root layout must declare its own: metadata does not cross a root
 * layout boundary, so sharing one object here is what keeps the two languages
 * from drifting apart on `metadataBase`, the title template or the icons.
 *
 * There is deliberately no `canonical`. A canonical inherited from a layout
 * outlives the page that should have overridden it — and a root layout's
 * canonical is `/`, which would deindex every page under `/en/**`. Pages state
 * their own through `entryMetadata` or `createMetadata`.
 */
export function rootMetadata(language: Language): Metadata {
  return {
    metadataBase: new URL(siteConfig.url),
    title: {
      default: siteConfig.name,
      template: `%s | ${siteConfig.name}`,
    },
    description: landingStrings[language].description,
    openGraph: {
      title: siteConfig.name,
      description: landingStrings[language].description,
      url: siteConfig.url,
      siteName: siteConfig.name,
      locale: metadataLocales[language].og,
      type: 'website',
    },
    icons: {
      shortcut: siteConfig.icon,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}
