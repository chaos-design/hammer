import { FloatNav } from '@docs/components/float-nav';
import { LangSetter } from '@docs/components/lang-setter';
import { SidebarEnhancer } from '@docs/components/sidebar-enhancer';
import { baseOptions } from '@docs/utils/layout.shared';
import {
  defaultLanguage,
  getRecentlyModifiedPagesWithLabels,
  source,
} from '@docs/utils/source';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';

export default function Layout({ children }: LayoutProps<'/docs'>) {
  // With i18n enabled the page tree is a per-language map; this tree serves
  // the default (Chinese, unprefixed) language.
  const tree = source.getPageTree(defaultLanguage);
  // Get recently modified pages with labels (last 7 days), scoped to this tree.
  const recentPagesMap = getRecentlyModifiedPagesWithLabels(defaultLanguage);

  return (
    <DocsLayout tree={tree} {...baseOptions()}>
      <LangSetter lang={defaultLanguage} />
      {children}
      <FloatNav />
      <SidebarEnhancer recentPagesMap={recentPagesMap} />
    </DocsLayout>
  );
}
