import { source } from '@docs/utils/source';
import type { MetadataRoute } from 'next';
import { siteConfig } from '@/fumadocs.config';

export const revalidate = false;

// The same origin `metadataBase` uses. A sitemap pointing at a different host
// than every `rel=canonical` on the site is a contradiction a crawler acts on.
const baseUrl = siteConfig.url;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const url = (path: string): string => new URL(path, baseUrl).toString();

  return [
    {
      url: url('/'),
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: url('/en'),
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: url('/docs'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: url('/en/docs'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    // `getPages()` returns every language tree, and `page.url` already carries
    // the `/en` prefix for English pages, so both languages are listed here.
    ...source.getPages().flatMap((page) => {
      const { lastModified } = page.data;

      return {
        url: url(page.url),
        lastModified: lastModified ? new Date(lastModified) : undefined,
        changeFrequency: 'weekly',
        priority: 0.5,
      } as MetadataRoute.Sitemap[number];
    }),
  ];
}
