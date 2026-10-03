import type { Language } from '@docs/utils/i18n';
import { getLLMText, type SourcePage, source } from '@docs/utils/source';
import { notFound } from 'next/navigation';

// Every page is enumerated at build time and served from static content, so the
// route can be prerendered. Required for `output: 'export'` (GitHub Pages).
export const dynamic = 'force-static';
export const revalidate = false;

const MARKDOWN_HEADERS = { 'Content-Type': 'text/markdown' };

/** The locale segment every non-default language is routed under. */
const NON_DEFAULT_LOCALE: Language = 'en';

/**
 * Maps a page URL to the slug this route is reached with.
 *
 * The route handles both languages through a single path, embedding the locale
 * as an optional leading `en` segment:
 *
 *   - `/docs/guides/installation.mdx`  -> `/llms.mdx/guides/installation.mdx`
 *   - `/en/docs/guides/installation.mdx` -> `/llms.mdx/en/guides/installation.mdx`
 */
function llmsSlugs(page: SourcePage): string[] {
  const language: Language = (page.locale ?? 'zh') as Language;
  const path = page.url
    .replace(/^\/en\/?docs\/?/, '')
    .replace(/^\/docs\/?/, '');

  const withMdx = path ? `${path}.mdx`.split('/') : ['index.mdx'];

  return language === NON_DEFAULT_LOCALE
    ? [NON_DEFAULT_LOCALE, ...withMdx]
    : withMdx;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug?: string[] }> },
) {
  const { slug = [] } = await params;

  let segments = slug
    .join('/')
    .replace(/\.mdx$/, '')
    .split('/')
    .filter(Boolean);

  let language: Language = 'zh';
  if (segments[0] === NON_DEFAULT_LOCALE) {
    language = NON_DEFAULT_LOCALE;
    segments = segments.slice(1);
  }

  const page = source.getPage(segments.filter(Boolean), language) as
    | SourcePage
    | undefined;

  if (!page) {
    notFound();
  }

  return new Response(await getLLMText(page), { headers: MARKDOWN_HEADERS });
}

export function generateStaticParams() {
  // All languages: default (unprefixed) plus English (`en`-prefixed slugs).
  return source.getPages().map((page) => ({ slug: llmsSlugs(page) }));
}
