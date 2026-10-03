import { NotFoundPage } from '@docs/components/not-found-page';
import { defaultLanguage } from '@docs/utils/source';

/**
 * The 404 for URLs that match no route at all, exported as `404.html`.
 *
 * A `notFound()` raised inside a route tree is handled by that tree's own
 * `not-found.tsx` — `(zh)/not-found.tsx` and `(en)/not-found.tsx` — and both
 * of those are wrapped by their root layout, so they get the full document
 * shell.
 *
 * This one cannot. It sits above every root layout, and Next renders a
 * root-level `not-found.tsx` inside a bare `<html>`: supplying `<html>`
 * here produces a nested one, which is worse. The cost is bounded — the page
 * on an unmatched URL has no `lang` attribute and falls back to the default
 * font stack. That is accepted rather than worked around, because the only way
 * to give this page a shell is to keep a single root layout, and then every
 * page under `/en/**` ships `lang="zh-CN"` in its HTML.
 */
export default function NotFound() {
  return <NotFoundPage language={defaultLanguage} />;
}
