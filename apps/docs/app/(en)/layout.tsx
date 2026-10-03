import { DocumentShell, rootMetadata } from '@docs/app/root-shell';
import type { Metadata } from 'next';

/**
 * Root layout for the English tree.
 *
 * The nesting looks redundant — a `(en)` group wrapping an `en` segment — and
 * both parts are load-bearing. Next only treats a layout as a *root* layout
 * when there is no `app/layout.tsx` and each language sits in its own route
 * group; the group is what makes this a second root. The `en` segment inside it
 * is what puts the routes at `/en/**`, because a route group contributes
 * nothing to a URL. Collapsing the two into one directory either way breaks a
 * different half of the site: drop the group and this becomes a nested layout
 * that renders a second `<html>`; drop the segment and the English pages move
 * to `/`.
 *
 * See `DocumentShell` for why there is more than one root layout at all.
 */
const LANGUAGE = 'en';

export const metadata: Metadata = rootMetadata(LANGUAGE);

export default function Layout({ children }: LayoutProps<'/en'>) {
  return <DocumentShell language={LANGUAGE}>{children}</DocumentShell>;
}
