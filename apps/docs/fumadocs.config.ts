export const siteConfig = {
  name: 'Hammer',
  icon: '/chao.png',
  url: 'http://localhost:3460',
  author: 'Rain120',
  description: '面向业务场景的高质量 React 组件和前端工具。',
  hero: {
    title: 'Hammer with Chaos Design',
    subtitle: '沉淀日常开发中高频使用的工具、组件。',
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
  // docs/components/landing/features.tsx
  features: {
    name: 'Hammer',
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
};
