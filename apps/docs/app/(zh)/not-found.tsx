import { NotFoundPage } from '@docs/components/not-found-page';
import { defaultLanguage } from '@docs/utils/source';

/**
 * The 404 for the default language, and for URLs that match no route at all.
 *
 * A `notFound()` raised inside the English tree is handled by
 * `app/en/not-found.tsx`, which sits inside the English root layout. This file
 * covers the default tree — which owns the app root, and therefore also the
 * unmatched-URL case that belongs to no tree — so it renders the default
 * language.
 */
export default function NotFound() {
  return <NotFoundPage language={defaultLanguage} />;
}
