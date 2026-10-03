import { HomeLayout } from '@docs/components/landing/entry-pages';

// The English tree hardcodes `en` rather than reading the default language:
// these routes only exist under the `/en` prefix.
export default function Layout({ children }: LayoutProps<'/en'>) {
  return <HomeLayout language="en">{children}</HomeLayout>;
}
