import { getLLMText, source } from '@docs/utils/source';
import { notFound } from 'next/navigation';

// Every page is enumerated at build time and served from static content, so the
// route can be prerendered. Required for `output: 'export'` (GitHub Pages).
export const dynamic = 'force-static';
export const revalidate = false;

const MARKDOWN_HEADERS = { 'Content-Type': 'text/markdown' };

/**
 * Maps a page URL (`/docs/components/calendar`) to the slug this route is
 * reached with via the `/docs/:path*.mdx` rewrite
 * (`components/calendar.mdx`).
 */
const toSlug = (url: string) => {
  const path = url.replace(/^\/docs\/?/, '');

  return path ? `${path}.mdx`.split('/') : ['index.mdx'];
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug?: string[] }> },
) {
  const { slug = [] } = await params;

  const page = source.getPage(
    slug
      .join('/')
      .replace(/\.mdx$/, '')
      .split('/')
      .filter(Boolean),
  );

  if (!page) {
    notFound();
  }

  return new Response(await getLLMText(page), { headers: MARKDOWN_HEADERS });
}

export function generateStaticParams() {
  return source.getPages().map((page) => ({ slug: toSlug(page.url) }));
}
