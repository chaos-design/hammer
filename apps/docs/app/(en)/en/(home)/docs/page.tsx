import { DocsEntry, entryMetadata } from '@docs/components/landing/entry-pages';

export const metadata = entryMetadata('/en/docs', 'en');

export default function Page() {
  return <DocsEntry language="en" />;
}
