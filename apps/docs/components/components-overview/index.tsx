import type { Language } from '@docs/utils/i18n';
import { defaultLanguage, type SourcePage, source } from '@docs/utils/source';
import { ComponentsOverviewClient } from './client';

type ComponentItem = {
  title: string;
  description?: string;
  href: string;
  preview?: string;
};

type ComponentsOverviewProps = {
  from: string;
  cover?: string;
  /**
   * Language tree to render overview cards from. Defaults to the default
   * (Chinese) tree; pass `"en"` from the English overview pages.
   */
  locale?: Language;
};

export function ComponentsOverview({
  from,
  cover,
  locale,
}: ComponentsOverviewProps) {
  if (!from) {
    return null;
  }

  const language: Language = locale ?? defaultLanguage;

  const items = source
    .getPages(language)
    .filter((page) => page.url.startsWith(`${from}/`))
    .filter((page) => page.url !== from)
    .map((page: SourcePage) => ({
      title: page.data.title,
      description: page.data.description,
      href: page.url,
      preview: page.data?.preview,
    }))
    .sort((a, b) => a.title.localeCompare(b.title));

  return (
    <ComponentsOverviewClient
      items={items as ComponentItem[]}
      fallbackPreviewSrc={cover}
    />
  );
}
