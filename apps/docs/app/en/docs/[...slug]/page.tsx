import { DocsPageBody } from '@docs/components/docs-page-body';
import { createMetadata } from '@docs/utils/metadata';
import {
  getLocaleAlternates,
  getPageImage,
  metadataLocales,
  type SourcePage,
  source,
} from '@docs/utils/source';
import type { Metadata } from 'next';

export const revalidate = false;

type PageProps = {
  params: Promise<{
    slug?: string[];
  }>;
};

export default async function Page(props: PageProps) {
  const { slug = [] } = await props.params;

  // This tree serves the English language under the `/en` prefix. The slugs
  // passed in do not include the locale segment (it is handled by the route).
  return <DocsPageBody slugs={slug} language="en" />;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { slug = [] } = await props.params;
  const page = source.getPage(slug, 'en') as SourcePage | undefined;

  // Return metadata for the not-found page rather than calling `notFound()`:
  // the parent layout already renders the 404 UI.
  if (!page)
    return createMetadata({
      title: 'Page not found',
    });

  const description =
    page.data.description ??
    'High-quality React components and front-end tooling for business scenarios.';

  const image = {
    // Root-relative: Next joins this onto `metadataBase.pathname`.
    url: getPageImage(page).url,
    width: 1200,
    height: 630,
  };

  return createMetadata({
    title: page.data.title,
    description,
    // Each language canonicalises to itself; the group is tied together by
    // `hreflang`, never by pointing English at the Chinese URL.
    alternates: getLocaleAlternates(page),
    openGraph: {
      url: page.url,
      images: [image],
      locale: metadataLocales.en.og,
    },
  });
}

export function generateStaticParams() {
  return source
    .generateParams('slug', 'lang')
    .filter(({ lang }) => lang === 'en');
}
