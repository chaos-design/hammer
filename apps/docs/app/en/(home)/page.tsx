import { entryMetadata, HomePage } from '@docs/components/landing/entry-pages';

export const metadata = entryMetadata('/en', 'en');

export default function Page() {
  return <HomePage language="en" />;
}
