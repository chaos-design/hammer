import { DocsPageBody } from '@docs/components/docs-page-body';
import { createMetadata } from '@docs/utils/metadata';
import {
  defaultLanguage,
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

  // This tree serves the default (Chinese) language, whose URLs carry no
  // locale prefix.
  return <DocsPageBody slugs={slug} language={defaultLanguage} />;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { slug = [] } = await props.params;
  const page = source.getPage(slug, defaultLanguage) as SourcePage | undefined;

  // Return metadata for the not-found page rather than calling `notFound()`:
  // the parent layout already renders the 404 UI.
  if (!page)
    return createMetadata({
      title: '未找到页面',
    });

  const description =
    page.data.description ?? '面向业务场景的高质量 React 组件与区块集合。';

  const image = {
    // Keep this root-relative. Next resolves metadata URLs with
    // `path.join(metadataBase.pathname, url)`, so prefixing here would emit
    // `/hammer/hammer/...`.
    url: getPageImage(page).url,
    width: 1200,
    height: 630,
  };

  return createMetadata({
    title: page.data.title,
    description,
    // The Chinese page canonicalises to itself; English links back here
    // through `hreflang`.
    alternates: getLocaleAlternates(page),
    openGraph: {
      url: page.url,
      images: [image],
      locale: metadataLocales[defaultLanguage].og,
    },
  });
}

export function generateStaticParams() {
  return source
    .generateParams('slug', 'lang')
    .filter(({ lang }) => lang === defaultLanguage);
}
