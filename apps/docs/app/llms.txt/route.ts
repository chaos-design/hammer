import { absoluteUrl } from '@docs/utils/base-path';
import { i18n, type Language } from '@docs/utils/i18n';
import { getLLMPath, type SourcePage, source } from '@docs/utils/source';
import { flattenTree } from 'fumadocs-core/page-tree';
import type { ReactNode } from 'react';
import { siteConfig } from '@/fumadocs.config';

/**
 * `/llms.txt` — the index that tells a language model what this site documents,
 * per https://llmstxt.org/.
 *
 * The index is the map, not the territory: `/llms-full.txt` is the territory
 * (every page concatenated into one document) and `/llms.mdx/**` serves a single
 * page. Building the index from the same page tree that renders the sidebar
 * means a newly authored page appears here in the same build, instead of on the
 * day somebody remembers to add a line to a hand-maintained list — which is
 * what makes this worth generating rather than writing out by hand.
 *
 * Three things the format asks for, kept here:
 *
 *   - one `#` title, a short `>` summary, then `##` sections of links;
 *   - absolute links, because the file is fetched out of context — a relative
 *     one would be resolved against whatever page the model happened to be on;
 *   - one line of prose per link (the frontmatter description), which is what a
 *     model selects on before spending a request on the page itself.
 *
 * Every link in the file is a page of this site, on one origin, which is what
 * lets `scripts/verify-docs-export.mjs` hold the export to resolving them all
 * instead of skipping the ones it cannot place. Add a link off-site and that
 * check has to start guessing which origin is the site.
 *
 * Both languages are listed. The two trees share content slugs and differ only
 * by the `/en` prefix, so dropping either would leave an agent reading the
 * other one with no way to reach the pages it prefers.
 */

// cached forever
export const revalidate = false;

const MARKDOWN_HEADERS = { 'Content-Type': 'text/plain; charset=utf-8' };

/**
 * Each language in its own language.
 *
 * Appended to every heading: `指南` and `Guides` are told apart by the reader,
 * but a machine should not have to infer a language from the script it is
 * written in to know that the entries below it are a translation.
 */
const LANGUAGE_LABEL: Record<Language, string> = {
  zh: '中文',
  en: 'English',
};

type Section = {
  title: string;
  pages: SourcePage[];
};

/**
 * The plain text of a tree node label.
 *
 * Fumadocs types node names as `ReactNode` because the sidebar renders them; a
 * text file cannot, so anything that is not already a string (an icon, a
 * fragment) is treated as no label rather than guessed at.
 */
function labelOf(node: ReactNode): string | undefined {
  return typeof node === 'string' ? node : undefined;
}

/**
 * One section per top-level folder, holding the pages in the order the site
 * itself presents them: `flattenTree` emits a `root: true` folder's own landing
 * page before its children, and the children follow `meta.json`, so the index
 * reads overview → detail exactly like the sidebar.
 *
 * A folder is skipped when none of its pages resolve to a `Page` — a menu with
 * nothing in it is not worth a heading.
 */
function sectionsOf(language: Language): Section[] {
  const sections: Section[] = [];

  for (const node of source.getPageTree(language).children) {
    if (node.type !== 'folder') continue;

    const pages = flattenTree([node])
      .map((item) => source.getNodePage(item, language))
      .filter((page): page is SourcePage => page !== undefined);

    if (pages.length === 0) continue;

    const label = labelOf(node.name);
    const languageLabel = LANGUAGE_LABEL[language];

    sections.push({
      title: label ? `${label} (${languageLabel})` : languageLabel,
      pages,
    });
  }

  return sections;
}

/** A page as one entry of a section: its title, its markdown URL, its summary. */
function entry(page: SourcePage): string {
  const url = absoluteUrl(getLLMPath(page));
  const description = page.data.description?.replace(/\s+/g, ' ').trim();

  // The description is optional in frontmatter; a bare link is a valid entry.
  return description
    ? `- [${page.data.title}](${url}): ${description}`
    : `- [${page.data.title}](${url})`;
}

export async function GET() {
  const name = siteConfig.features.name;
  const sections = i18n.languages.flatMap((language) =>
    sectionsOf(language).map((section) =>
      [`## ${section.title}`, '', ...section.pages.map(entry), ''].join('\n'),
    ),
  );

  // The full dump is generated too, and it is the cheaper answer whenever a
  // model wants the whole site rather than a page it picked from this list.
  const total = source.getPages().length;
  const endpoints = [
    '## 机器可读端点 / Machine-readable endpoints',
    '',
    `- [llms-full.txt](${absoluteUrl('/llms-full.txt')}): 中英两种语言的全部 ${total} 个页面拼接成的一份 Markdown 长文。`,
  ].join('\n');

  // Plain text rather than a link: every link in this file is a page of this
  // site, which is what lets `verify-docs-export.mjs` hold it to resolving —
  // see the note there.
  const repository = siteConfig.links.github.replace(/^https?:\/\//, '');

  return new Response(
    [
      `# ${name}`,
      '',
      `> ${name} 是 chaos-design 的 monorepo 工具链与 shadcn/ui 风格 React 组件库的文档站。`,
      "> Documentation for chaos-design's monorepo of build tooling and",
      '> shadcn/ui-style React components.',
      '',
      '文档分中英两种语言：中文是默认语言，URL 不带语言前缀；英文位于 `/en` 前缀下。',
      '下面每条链接都指向该页面的 Markdown 原文（`Content-Type: text/markdown`），',
      '而不是渲染后的 HTML —— 需要网页版本时按 `/docs/**`（中文）与 `/en/docs/**`',
      `（英文）访问即可。源码见 ${repository}。`,
      '',
      ...sections,
      endpoints,
      '',
    ].join('\n'),
    { headers: MARKDOWN_HEADERS },
  );
}
