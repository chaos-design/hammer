import type { Language } from '@docs/utils/i18n';
import { getPageImage, type SourcePage, source } from '@docs/utils/source';
import { notFound } from 'next/navigation';
import { ImageResponse } from 'next/og';
import { getImageResponseOptions, generate as MetadataImage } from './generate';

export const revalidate = false;

type RouteParams = {
  params: Promise<{ slug: string[] }>;
};

export async function GET(_req: Request, { params }: RouteParams) {
  const { slug } = await params;

  // The image path carries the locale as an optional leading segment, matching
  // `getPageImage`. Strip it before resolving the page.
  let segments = slug.slice(0, -1);
  let language: Language = 'zh';
  if (segments[0] === 'en') {
    language = 'en';
    segments = segments.slice(1);
  }

  const page = source.getPage(segments, language) as SourcePage | undefined;

  if (!page) {
    notFound();
  }

  return new ImageResponse(
    <MetadataImage
      description={page.data.description}
      title={page.data.title}
    />,
    getImageResponseOptions(),
  );
}

export function generateStaticParams(): { slug: string[] }[] {
  // All languages; `getPageImage` prefixes the non-default locale so Chinese
  // and English pages emit distinct OG image files.
  return source.getPages().map((page: SourcePage) => ({
    slug: getPageImage(page).segments,
  }));
}
