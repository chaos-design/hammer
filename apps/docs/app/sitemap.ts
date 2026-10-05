import { absoluteUrl } from '@docs/utils/base-path';
import { source } from '@docs/utils/source';
import type { MetadataRoute } from 'next';

export const revalidate = false;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return [
    {
      url: absoluteUrl('/'),
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: absoluteUrl('/en'),
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: absoluteUrl('/docs'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: absoluteUrl('/en/docs'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    // `getPages()` returns every language tree, and `page.url` already carries
    // the `/en` prefix for English pages, so both languages are listed here.
    ...source.getPages().flatMap((page) => {
      const { lastModified } = page.data;

      return {
        url: absoluteUrl(page.url),
        lastModified: lastModified ? new Date(lastModified) : undefined,
        changeFrequency: 'weekly',
        priority: 0.5,
      } as MetadataRoute.Sitemap[number];
    }),
  ];
}
