'use client';

import { useEffect } from 'react';

/**
 * Sets the `<html lang>` attribute for a language subtree.
 *
 * The root layout owns the `<html>` element and defaults to `zh-CN`, so the
 * English subtree re-points it to `en` on mount. `suppressHydrationWarning` is
 * set on the root `<html>` to avoid the hydration-mismatch warning.
 */
export function LangSetter({ lang }: { lang: string }) {
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return null;
}
