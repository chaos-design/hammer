import { getLLMText, source } from '@docs/utils/source';
import { notFound } from 'next/navigation';

export const revalidate = false;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug?: string[] }> },
) {
  const { slug = [] } = await params;

  // Special case: if slug is ['index.mdx'], we want to fetch the root page []
  if (slug.length === 1 && slug[0] === 'index.mdx') {
    const page = source.getPage([]);
    if (page) {
      return new Response(await getLLMText(page), {
        headers: {
          'Content-Type': 'text/markdown',
        },
      });
    }
  }
}
