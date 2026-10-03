import { metadataLocales } from '@docs/utils/source';
import { cn } from '@docs/utils/utils';
import { Library, Pencil } from 'lucide-react';
import type { Metadata } from 'next';
import Link, { type LinkProps } from 'next/link';

// Stated explicitly: without it this page inherits the root layout's
// `canonical: '/'`, which would tell search engines to drop the whole English
// docs entry page in favour of the Chinese homepage.
export const metadata: Metadata = {
  alternates: {
    canonical: '/en/docs',
    languages: { 'zh-CN': '/docs', en: '/en/docs' },
  },
  openGraph: { url: '/en/docs', locale: metadataLocales.en.og },
};

export default function DocsPage() {
  return (
    <main className="container z-2 flex flex-1 flex-col items-center justify-center py-24 md:py-36 text-center">
      <h1 className="mb-4 font-semibold text-3xl md:text-4xl">Get started</h1>
      <p className="text-foreground/70 text-md">
        Pick the documentation entry that fits you and keep browsing.
      </p>
      <div className="mt-8 grid grid-cols-1 gap-4 text-start md:grid-cols-3">
        {[
          {
            name: 'Guides',
            description: 'Installation, changelog and usage.',
            icon: <Library className="size-full" />,
            href: '/en/docs/guides',
          },
          {
            name: 'Components',
            description: 'Base components and examples.',
            icon: <Pencil className="size-full" />,
            href: '/en/docs/components',
          },
          {
            name: 'Business Components',
            description: 'Business components and compositions.',
            icon: <Pencil className="size-full" />,
            href: '/en/docs/blocks',
          },
        ].map((item) => (
          <Item
            href={item.href}
            key={item.name}
            className="flex flex-row gap-4"
          >
            <Icon>{item.icon}</Icon>
            <div className="flex flex-col">
              <h2 className="mb-2 font-semibold">{item.name}</h2>
              <p className="text-foreground/70 text-sm">{item.description}</p>
            </div>
          </Item>
        ))}
      </div>
    </main>
  );
}

function Icon({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2 size-8 rounded-lg  bg-primary p-1 text-foreground/70 border ">
      {children}
    </div>
  );
}

function Item(
  props: LinkProps & { children: React.ReactNode; className?: string },
) {
  return (
    <Link
      {...props}
      className={cn(
        'rounded-2xl border bg-card p-4 shadow-lg',
        props.className,
      )}
    >
      {props.children}
    </Link>
  );
}
