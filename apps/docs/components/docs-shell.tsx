import { FloatNav } from '@docs/components/float-nav';
import { SidebarEnhancer } from '@docs/components/sidebar-enhancer';
import type { Language } from '@docs/utils/i18n';
import { baseOptions } from '@docs/utils/layout.shared';
import { getRecentlyModifiedPagesWithLabels, source } from '@docs/utils/source';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';

/**
 * The documentation chrome, shared by both language trees.
 *
 * With i18n enabled the page tree and the recent-modification labels are
 * per-language, so the only thing that differs between `/docs/**` and
 * `/en/docs/**` is the language. Deriving both from the `language` prop means
 * a sidebar change is made once instead of in two layouts that were free to
 * drift.
 */
export function DocsShell({
  language,
  children,
}: {
  language: Language;
  children: React.ReactNode;
}) {
  const tree = source.getPageTree(language);
  // Recent modifications are scoped to this tree so the sidebar never labels
  // a page from the other language.
  const recentPagesMap = getRecentlyModifiedPagesWithLabels(language);

  return (
    <DocsLayout tree={tree} {...baseOptions()}>
      {children}
      <FloatNav />
      <SidebarEnhancer recentPagesMap={recentPagesMap} />
    </DocsLayout>
  );
}
