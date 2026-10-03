import type { Metadata } from 'next/types';

/**
 * Fill the Open Graph defaults for a documentation page.
 *
 * `openGraph.locale` has no default on purpose: it is the language of the
 * rendered page, so a single hard-coded value would mislabel the whole
 * Chinese tree as English. Callers pass it via `metadataLocales`.
 *
 * `alternates` is always overridden (never inherited from a layout) so the
 * root layout's `canonical: '/'` cannot leak onto `/docs/**` or `/en/**`.
 */
export function createMetadata(override: Metadata): Metadata {
  const defaultOgImage = {
    width: 1200,
    height: 630,
    url: '',
    alt: 'Cover',
  };

  return {
    ...override,
    openGraph: {
      title: override.title ?? undefined,
      description: override.description ?? undefined,
      url: '',
      images: [defaultOgImage],
      siteName: 'ChaosDesign',
      type: 'website',
      ...override.openGraph,
    },
    alternates: {
      ...override.alternates,
    },
  };
}

export const baseUrl =
  process.env.NODE_ENV === 'development' ||
  !process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? new URL('http://localhost:3000')
    : new URL(`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`);
