import { landingStrings } from '@docs/utils/locales';
import { defaultLanguage, metadataLocales } from '@docs/utils/source';
import { RootProvider } from 'fumadocs-ui/provider/next';
import type { Metadata } from 'next';
import './global.css';
import { siteConfig } from '@/fumadocs.config';
import { inter, poppins } from './fonts';

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  alternates: {
    canonical: '/',
  },
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  // The default language's copy: this layout is shared by both trees and
  // cannot know which one is rendering. Every page that is not in the default
  // language overrides it — see `entryMetadata` and `createMetadata`.
  description: landingStrings[defaultLanguage].description,
  openGraph: {
    title: siteConfig.name,
    description: landingStrings[defaultLanguage].description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    locale: metadataLocales[defaultLanguage].og,
    type: 'website',
  },
  icons: {
    shortcut: siteConfig.icon,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html
      className={`${inter.className} ${inter.variable} ${poppins.variable}`}
      lang="zh-CN"
      suppressHydrationWarning
    >
      <body className="flex min-h-screen flex-col">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
