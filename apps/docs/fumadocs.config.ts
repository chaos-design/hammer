import { canonicalUrl, withBasePath } from './utils/base-path';

export const siteConfig = {
  name: 'Hammer',
  // A string literal in `public/` is served from the site root and is not
  // rewritten by Next, so the basePath has to be applied by hand.
  icon: withBasePath('/chao.png'),
  // Canonical origin for `metadataBase` and OpenGraph/Twitter URLs. Never
  // `localhost` in a deployed build: it is what turns a relative image path
  // into an absolute `og:image`, so a localhost value makes every shared link
  // render without a preview.
  url: canonicalUrl,
  author: 'Rain120',
  hero: {
    orbitSize: 360,
    coreSize: 22,
    imageScale: 16,
    centerImage: undefined,
  },
  links: {
    github: 'https://github.com/chaos-design/hammer',
  },
  navItems: [
    {
      type: 'menu',
      label: '组件',
      icon: 'layout-dashboard',
      defaultPreview: 'text',
      items: [
        {
          label: '日程',
          description: '支持日程管理与多视图切换的日历组件。',
          href: '/docs/components/calendar',
          icon: 'calendar',
          previewSection: 'components',
        },
        {
          label: '月份选择器',
          description: '用于选择月份与年份的轻量日期选择器。',
          href: '/docs/components/month-datepicker',
          icon: 'calendar-days',
          previewSection: 'basic',
        },
        {
          label: '颜色选择器',
          description: '支持 HEX、RGB 与 HSB 的颜色选择组件。',
          href: '/docs/components/color-picker',
          icon: 'palette',
          previewSection: 'text',
        },
      ],
    },
    {
      type: 'link',
      label: '指南',
      href: '/docs/guides',
      icon: 'book',
    },
  ],
  github: {
    // INFO: config as needed
    owner: 'chaos-design',
    repo: 'hammer',
    paths: (type: 'component' | 'block', name: string) =>
      type === 'component'
        ? `apps/docs/content/docs/content/components/${name}/index.tsx`
        : `apps/docs/content/docs/content/blocks/${name}/index.tsx`,
    contentPath: 'apps/docs/content/docs',
  },
  preview: {
    sources: [
      {
        dir: 'examples',
        importer: 'examples',
      },
    ],
  },
  // Language-independent strings only. Anything a reader sees in prose lives
  // in `utils/locales.ts`, keyed by language, so there is exactly one place to
  // change it and no chance of a stale translation left behind here.
  features: {
    name: 'Hammer',
  },
};
