import Footer from '@docs/components/landing/footer';
import { Hero } from '@docs/components/landing/hero';
import { metadataLocales } from '@docs/utils/source';
import type { Metadata } from 'next';
import { Features } from '../../components/landing/features';

export const metadata: Metadata = {
  alternates: {
    canonical: '/',
    languages: { 'zh-CN': '/', en: '/en' },
  },
  // Stated explicitly: the root layout's `openGraph` describes the Chinese
  // homepage, and every page inherits it unless it says otherwise.
  openGraph: { url: '/', locale: metadataLocales.zh.og },
};

export default function Home() {
  return (
    <>
      <Hero />
      <Features />
      {/* <ComponentsSlideshow /> */}
      {/* <BlockCategories /> */}
      <Footer />
    </>
  );
}
