import { FloatNav } from '@docs/components/float-nav';
import { LangSetter } from '@docs/components/lang-setter';
import { SidebarEnhancer } from '@docs/components/sidebar-enhancer';
import { baseOptions } from '@docs/utils/layout.shared';
import { getRecentlyModifiedPagesWithLabels, source } from '@docs/utils/source';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';

export default function Layout({ children }: { children: React.ReactNode }) {
  // English page tree, scoped to the `/en` locale.
  const tree = source.getPageTree('en');
  const recentPagesMap = getRecentlyModifiedPagesWithLabels('en');

  return (
    <DocsLayout tree={tree} {...baseOptions()}>
      <LangSetter lang="en" />
      {children}
      <FloatNav />
      <SidebarEnhancer recentPagesMap={recentPagesMap} />
    </DocsLayout>
  );
}
