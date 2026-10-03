import { HomeLayout } from '@docs/components/landing/entry-pages';
import { defaultLanguage } from '@docs/utils/source';

export default function Layout({ children }: LayoutProps<'/'>) {
  return <HomeLayout language={defaultLanguage}>{children}</HomeLayout>;
}
