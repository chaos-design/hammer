import { DocsShell } from '@docs/components/docs-shell';

export default function Layout({ children }: LayoutProps<'/en/docs'>) {
  return <DocsShell language="en">{children}</DocsShell>;
}
