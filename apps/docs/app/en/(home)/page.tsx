import { Features } from '@docs/components/landing/features';
import Footer from '@docs/components/landing/footer';
import { Hero } from '@docs/components/landing/hero';
import { metadataLocales } from '@docs/utils/source';
import type { Metadata } from 'next';

// Stated explicitly: without it this page inherits the root layout's
// `canonical: '/'`, which would deindex the English homepage entirely.
export const metadata: Metadata = {
  alternates: {
    canonical: '/en',
    languages: { 'zh-CN': '/', en: '/en' },
  },
  openGraph: { url: '/en', locale: metadataLocales.en.og },
};

export default function Home() {
  return (
    <>
      <Hero language="en" />
      <Features language="en" />
      <Footer />
    </>
  );
}
