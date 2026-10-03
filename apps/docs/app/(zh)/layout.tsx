import { DocumentShell, rootMetadata } from '@docs/app/root-shell';
import { defaultLanguage } from '@docs/utils/source';
import type { Metadata } from 'next';

/**
 * Root layout for the default language.
 *
 * The site has one root layout per language instead of a single
 * `app/layout.tsx`, which is what lets `<html lang>` be rendered on the
 * server rather than patched after hydration. See `DocumentShell`.
 *
 * `(zh)` is a route group: the default language is unprefixed in URLs, and the
 * group is what makes this a root layout Next treats as separate from the
 * English one.
 */
export const metadata: Metadata = rootMetadata(defaultLanguage);

export default function Layout({ children }: LayoutProps<'/'>) {
  return <DocumentShell language={defaultLanguage}>{children}</DocumentShell>;
}
