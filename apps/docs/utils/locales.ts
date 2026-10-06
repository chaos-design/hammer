import type { Language } from './i18n';

/**
 * Landing-page (marketing) strings for each language.
 *
 * The docs page trees are localized through Fumadocs content files; this map
 * covers the static marketing home (hero + features + docs-entry cards), which
 * is rendered by React components rather than MDX.
 */
export type LandingStrings = {
  /**
   * Site description, used for the `description`, `og:description` and
   * `twitter:description` of the pages that have no content frontmatter.
   * Without it every English page advertises the Chinese one-liner.
   */
  description: string;
  heroTitle: string;
  heroSubtitle: string;
  ctaStart: { label: string; href: string };
  ctaBrowse: { label: string; href: string };
  features: {
    title: string;
    items: Array<{
      title: string;
      description: string;
      icon: 'react' | 'tailwind' | 'shadcn';
    }>;
  };
  docsTitle: string;
  docsSubtitle: string;
  docsItems: Array<{
    name: string;
    description: string;
    href: string;
    icon: 'guides' | 'components' | 'blocks';
  }>;
};

/**
 * The shape of a single navbar entry, mirroring `siteConfig.navItems`.
 */
export type NavItemLike =
  | {
      type: 'menu';
      label: string;
      icon?: string;
      defaultPreview?: string;
      items: Array<{
        label: string;
        href: string;
        description?: string;
        icon?: string;
        previewSection?: string;
      }>;
    }
  | {
      type: 'link';
      label: string;
      href: string;
      icon?: string;
    };

/**
 * Navbar entries for the English (prefixed) tree. The Chinese tree keeps
 * reading straight from `siteConfig.navItems` so it stays byte-stable.
 */
export const enNavItems: NavItemLike[] = [
  {
    type: 'menu',
    label: 'Components',
    icon: 'layout-dashboard',
    defaultPreview: 'text',
    items: [
      {
        label: 'Calendar',
        description: 'Schedule management with multi-view calendar.',
        href: '/en/docs/components/calendar',
        icon: 'calendar',
        previewSection: 'components',
      },
      {
        label: 'Month Datepicker',
        description: 'Lightweight picker for a month and year.',
        href: '/en/docs/components/month-datepicker',
        icon: 'calendar-days',
        previewSection: 'basic',
      },
      {
        label: 'Color Picker',
        description: 'Color picker supporting HEX, RGB and HSB.',
        href: '/en/docs/components/color-picker',
        icon: 'palette',
        previewSection: 'text',
      },
      {
        label: 'Theme Switch',
        description: 'Switches between light, dark and system themes.',
        href: '/en/docs/components/theme-switch',
        icon: 'sun-moon',
        previewSection: 'basic',
      },
    ],
  },
  {
    type: 'link',
    label: 'Guides',
    href: '/en/docs/guides',
    icon: 'book',
  },
];

/**
 * Strings for chrome the content files do not own: labels the app renders
 * itself. Without these a shared component silently speaks Chinese on every
 * English page.
 */
export type UiStrings = {
  /** Prefix before the timestamp. */
  lastModified: string;
  /** BCP 47 tag for `toLocaleString`. */
  dateLocale: string;
  /**
   * Timezone the timestamp is rendered in. A timestamp without one is
   * ambiguous, so it follows the language: the Chinese audience reads Beijing
   * time, everyone else gets UTC.
   */
  timeZone: string;
  notFound: {
    /** Small label above the heading, e.g. `Error 404`. */
    code: string;
    title: string;
    goBack: string;
    goHome: string;
  };
};

export const uiStrings: Record<Language, UiStrings> = {
  zh: {
    lastModified: '最后更新：',
    dateLocale: 'zh-CN',
    timeZone: 'Asia/Shanghai',
    notFound: {
      code: '错误 404',
      title: '没有找到内容',
      goBack: '返回上一页',
      goHome: '回到首页',
    },
  },
  en: {
    lastModified: 'Last updated:',
    dateLocale: 'en-GB',
    timeZone: 'UTC',
    notFound: {
      code: 'Error 404',
      title: 'You found Nothing.',
      goBack: 'Go back',
      goHome: 'Take me home',
    },
  },
};

export const landingStrings: Record<Language, LandingStrings> = {
  zh: {
    description: '面向业务场景的高质量 React 组件和前端工具。',
    heroTitle: 'Hammer with Chaos Design',
    heroSubtitle: '沉淀日常开发中高频使用的工具、组件。',
    ctaStart: { label: '开始使用', href: '/docs/guides' },
    ctaBrowse: { label: '浏览组件', href: '/docs/components' },
    features: {
      title: '为什么选择 ',
      items: [
        {
          title: 'React',
          description:
            '基于现代 React 模式构建，包括服务端组件、TypeScript 和 Hook，以实现最佳性能。',
          icon: 'react',
        },
        {
          title: 'Tailwindcss',
          description:
            '基于 Tailwind CSS v4 构建，采用最新的实用优先 CSS 框架，支持增强的暗黑模式和现代设计模式。',
          icon: 'tailwind',
        },
        {
          title: '兼容 shadcn/ui',
          description:
            '完全兼容 shadcn/ui 生态系统。易于集成到现有的 shadcn/ui 项目中，并遵循相同的开发模式。',
          icon: 'shadcn',
        },
      ],
    },
    docsTitle: '快速开始',
    docsSubtitle: '选择你需要的文档入口继续浏览。',
    docsItems: [
      {
        name: '指南',
        description: '安装、更新日志与使用说明。',
        href: '/docs/guides',
        icon: 'guides',
      },
      {
        name: '组件',
        description: '基础组件与使用示例。',
        href: '/docs/components',
        icon: 'components',
      },
      {
        name: '业务组件',
        description: '业务组件与组合方案。',
        href: '/docs/blocks',
        icon: 'blocks',
      },
    ],
  },
  en: {
    description: 'High-quality React components and front-end tooling.',
    heroTitle: 'Hammer with Chaos Design',
    heroSubtitle: 'The tools and components you reach for most, day to day.',
    ctaStart: { label: 'Get started', href: '/en/docs/guides' },
    ctaBrowse: { label: 'Browse components', href: '/en/docs/components' },
    features: {
      title: 'Why choose ',
      items: [
        {
          title: 'React',
          description:
            'Built on modern React patterns — server components, TypeScript and hooks — for the best performance.',
          icon: 'react',
        },
        {
          title: 'Tailwind CSS',
          description:
            'Built on Tailwind CSS v4, the latest utility-first framework, with enhanced dark mode and modern design patterns.',
          icon: 'tailwind',
        },
        {
          title: 'shadcn/ui compatible',
          description:
            'Fully compatible with the shadcn/ui ecosystem. Easy to integrate into existing projects and following the same conventions.',
          icon: 'shadcn',
        },
      ],
    },
    docsTitle: 'Get started',
    docsSubtitle:
      'Pick the documentation entry that fits you and keep browsing.',
    docsItems: [
      {
        name: 'Guides',
        description: 'Installation, changelog and usage.',
        href: '/en/docs/guides',
        icon: 'guides',
      },
      {
        name: 'Components',
        description: 'Base components and examples.',
        href: '/en/docs/components',
        icon: 'components',
      },
      {
        name: 'Business components',
        description: 'Business components and compositions.',
        href: '/en/docs/blocks',
        icon: 'blocks',
      },
    ],
  },
};
