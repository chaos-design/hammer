/**
 * The markdown copy of a single documentation page.
 *
 * Every language is served through one path, the locale embedded as an optional
 * leading segment, so the trees cost one route instead of one per language that
 * could drift apart:
 *
 *   - `/llms.mdx/guides/installation.mdx`   — the default language
 *   - `/llms.mdx/en/guides/installation.mdx` — every other one
 *
 * Which slug serves a page is {@link getLLMSlugs}'s decision; this route only
 * parses such a slug back into a language and page slugs, and both sides read
 * `i18n` so that adding a language cannot half-work. `next.config.ts` also
 * rewrites `/docs/**.mdx` onto these paths, which is a convenience for
 * Vercel — not the address to publish, since the static export does not carry
 * rewrites.
 */

import { i18n, type Language } from '@docs/utils/i18n';
import {
  defaultLanguage,
  getLLMSlugs,
  getLLMText,
  type SourcePage,
  source,
} from '@docs/utils/source';
import { notFound } from 'next/navigation';

// Every page is enumerated at build time and served from static content, so the
// route can be prerendered. Required for `output: 'export'` (GitHub Pages).
export const dynamic = 'force-static';
export const revalidate = false;

// `charset` is not decoration: the body is Markdown full of CJK prose, and
// `text/markdown` carries no default encoding for a client to fall back on.
const MARKDOWN_HEADERS = {
  'Content-Type': 'text/markdown; charset=utf-8',
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug?: string[] }> },
) {
  const { slug = [] } = await params;

  const segments = slug
    .join('/')
    .replace(/\.mdx$/, '')
    .split('/')
    .filter(Boolean);

  // The inverse of `getLLMSlugs`: a leading segment naming a language is the
  // locale, anything else is the first page slug.
  const [first, ...rest] = segments;
  const hasLocale = i18n.languages.includes(first as Language);
  const language = hasLocale ? (first as Language) : defaultLanguage;
  const slugs = hasLocale ? rest : segments;

  const page = source.getPage(slugs, language) as SourcePage | undefined;

  if (!page) {
    notFound();
  }

  return new Response(await getLLMText(page), { headers: MARKDOWN_HEADERS });
}

export function generateStaticParams() {
  // All languages: the default one unprefixed, every other one prefixed.
  // `getLLMSlugs` is the one place that decides which slug serves a page, so
  // the routes emitted here and the links in `/llms.txt` cannot disagree.
  return source.getPages().map((page) => ({ slug: getLLMSlugs(page) }));
}
