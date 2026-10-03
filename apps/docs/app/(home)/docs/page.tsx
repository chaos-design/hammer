import { DocsEntry, entryMetadata } from '@docs/components/landing/entry-pages';
import { defaultLanguage } from '@docs/utils/source';

export const metadata = entryMetadata('/docs', defaultLanguage);

export default function Page() {
  return <DocsEntry language={defaultLanguage} />;
}
