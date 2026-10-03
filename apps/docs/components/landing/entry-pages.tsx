import { BlurMagic } from '@docs/components/blurmagic/blurmagic';
import { FloatNav } from '@docs/components/float-nav';
import { BgLines } from '@docs/components/landing/bg-lines';
import Divider from '@docs/components/landing/divider';
import { Features } from '@docs/components/landing/features';
import Footer from '@docs/components/landing/footer';
import { Hero } from '@docs/components/landing/hero';
import Navbar from '@docs/components/landing/navbar/navbar';
import type { Language } from '@docs/utils/i18n';
import { switchLocale } from '@docs/utils/locale-copy';
import { landingStrings } from '@docs/utils/locales';
import { defaultLanguage, metadataLocales } from '@docs/utils/source';
import { Library, Pencil } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

/**
 * The four hand-authored pages of the site — `/`, `/docs`, `/en` and
 * `/en/docs` — as one language-parameterized set.
 *
 * They used to be four near-identical files, two per language, which meant a
 * layout or markup change had to be made twice and nothing caught a miss: the
 * two trees drifted into separate client bundles and the build stayed green.
 * Everything that differs between the languages now comes from
 * `landingStrings` and the `language` prop, so the route files hold a single
 * `entryMetadata` call and nothing else.
 */

/** The other language of the one given. */
const other = (language: Language): Language =>
  language === 'en' ? 'zh' : 'en';

/**
 * Metadata for an entry page.
 *
 * Every field is stated rather than inherited. The root layout is shared by
 * both languages and describes the Chinese homepage, so an entry page that
 * says nothing is served a `canonical` of `/` and a Chinese `description` —
 * the first tells a crawler to drop the page, the second makes every English
 * link preview Chinese.
 */
export function entryMetadata(
  url: string,
  language: Language = defaultLanguage,
): Metadata {
  const counterpart = other(language);

  return {
    description: landingStrings[language].description,
    alternates: {
      canonical: url,
      languages: {
        [metadataLocales[language].hreflang]: url,
        [metadataLocales[counterpart].hreflang]: switchLocale(url, counterpart),
      },
    },
    openGraph: { url, locale: metadataLocales[language].og },
  };
}

/** Icons for the docs entry cards, resolved from the locale-neutral key. */
const DOCS_ENTRY_ICONS = {
  guides: Library,
  components: Pencil,
  blocks: Pencil,
} as const;

/**
 * Shell shared by both language homepages: the navbar and the floating
 * controls, all of which need the language.
 */
export function HomeLayout({
  language = defaultLanguage,
  children,
}: {
  language?: Language;
  children: React.ReactNode;
}) {
  return (
    <div className="relative isolate bg-primary transition">
      <BgLines />
      <main className="relative mx-auto min-h-screen w-full max-w-7xl overflow-y-auto">
        <BlurMagic
          background="var(--color-background)"
          blur="4px"
          className="-translate-x-1/2! left-1/2! z-20 h-[120px]! w-full! max-w-[inherit]!"
          side="top"
          stop="50%"
        />
        <Navbar className="mx-auto max-w-7xl" language={language} />
        <Divider orientation="vertical" />
        <Divider className="right-auto left-0" orientation="vertical" />
        <section className="flex flex-col overflow-hidden">{children}</section>
        <BlurMagic
          background="var(--color-background)"
          className="-translate-x-1/2! left-1/2! z-20 h-[120px]! w-full! max-w-[inherit]!"
          side="bottom"
        />
        <FloatNav />
      </main>
    </div>
  );
}

/** The marketing homepage, `/` and `/en`. */
export function HomePage({
  language = defaultLanguage,
}: {
  language?: Language;
}) {
  return (
    <>
      <Hero language={language} />
      <Features language={language} />
      {/* <ComponentsSlideshow /> */}
      {/* <BlockCategories /> */}
      <Footer />
    </>
  );
}

/** The documentation entry page, `/docs` and `/en/docs`. */
export function DocsEntry({
  language = defaultLanguage,
}: {
  language?: Language;
}) {
  const { docsTitle, docsSubtitle, docsItems } = landingStrings[language];

  return (
    <main className="container z-2 flex flex-1 flex-col items-center justify-center py-24 md:py-36 text-center">
      <h1 className="mb-4 font-semibold text-3xl md:text-4xl">{docsTitle}</h1>
      <p className="text-foreground/70 text-md">{docsSubtitle}</p>
      <div className="mt-8 grid grid-cols-1 gap-4 text-start md:grid-cols-3">
        {docsItems.map((item) => {
          const Icon = DOCS_ENTRY_ICONS[item.icon];

          return (
            <Link
              href={item.href}
              key={item.href}
              className="flex flex-row gap-4 rounded-2xl border bg-card p-4 shadow-lg"
            >
              <span className="mb-2 size-8 rounded-lg border bg-primary p-1 text-foreground/70">
                <Icon className="size-full" />
              </span>
              <span className="flex flex-col">
                <span className="mb-2 font-semibold">{item.name}</span>
                <span className="text-foreground/70 text-sm">
                  {item.description}
                </span>
              </span>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
