import { entryMetadata, HomePage } from '@docs/components/landing/entry-pages';
import { defaultLanguage } from '@docs/utils/source';

export const metadata = entryMetadata('/', defaultLanguage);

export default function Page() {
  return <HomePage language={defaultLanguage} />;
}
