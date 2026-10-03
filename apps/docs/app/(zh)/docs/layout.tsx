import { DocsShell } from '@docs/components/docs-shell';
import { defaultLanguage } from '@docs/utils/source';

export default function Layout({ children }: LayoutProps<'/docs'>) {
  return <DocsShell language={defaultLanguage}>{children}</DocsShell>;
}
