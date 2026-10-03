'use client';

import type { Language } from '@docs/utils/i18n';
import { detectLocale, switchLocale } from '@docs/utils/locale-copy';
import { cn } from '@docs/utils/utils';
import { Languages } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LANGUAGE_LABELS: Record<Language, string> = {
  zh: '简体中文',
  en: 'English',
};

/** The language the user can switch *to* from the current one. */
function otherLanguage(locale: Language): Language {
  return locale === 'en' ? 'zh' : 'en';
}

/**
 * Compute the target pathname (basePath-less) for the *other* language, from
 * the current pathname. Respects the site's `hideLocale: 'default-locale'`
 * routing: the default language (Chinese) is unprefixed, English is under
 * `/en`. The returned value is safe for `next/link` / `router.push`, which
 * re-apply the basePath.
 */
function switchTarget(pathname: string): {
  nextPath: string;
  target: Language;
} {
  const current = detectLocale(pathname);
  const target = otherLanguage(current);
  return { nextPath: switchLocale(pathname, target), target };
}

/**
 * Floating pill used in the docs `FloatNav`. Styled like the other floating
 * triggers (theme / colour sync).
 */
export function LanguageSwitcher({ className }: { className?: string }) {
  const pathname = usePathname() ?? '/';
  const { nextPath, target } = switchTarget(pathname);

  return (
    <Link
      href={nextPath}
      aria-label={LANGUAGE_LABELS[target]}
      className={cn('float-trigger h-auto w-auto p-2!', className)}
    >
      <Languages size={18} className="text-foreground/80" />
    </Link>
  );
}

/**
 * Text pill used in the landing navbar (which has no floating chrome).
 */
export function LanguageSwitcherLink({ className }: { className?: string }) {
  const pathname = usePathname() ?? '/';
  const { nextPath, target } = switchTarget(pathname);

  return (
    <Link
      href={nextPath}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-border/60 px-3 py-1.5 text-sm font-medium text-foreground/80 transition hover:border-fd-primary/40 hover:text-foreground',
        className,
      )}
    >
      <Languages size={14} />
      {LANGUAGE_LABELS[target]}
    </Link>
  );
}

export { LANGUAGE_LABELS };
