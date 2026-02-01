# Hammer 文档站点

## 概述

本目录是 Hammer 的文档站点，基于 Next.js 与 Fumadocs 构建，用于展示基础组件与业务组件的说明、示例与指南。

## 快速开始

### 环境要求

- Node.js 18+
- pnpm 8+

### 安装依赖

```bash
pnpm install
```

### 本地开发

```bash
pnpm run dev
```

默认地址：http://localhost:3460

### 生产构建

```bash
pnpm run build
pnpm run start
```

## 文档编写

### 文档目录

所有 MDX 文档位于 `content/docs`，按目录即路由组织。

### 组件总览

组件总览页使用内置组件 `<ComponentsOverview />` 自动生成组件卡片，可通过 frontmatter 提供预览图：

```mdx
---
title: 日程
description: 支持月/周/日视图与事件编辑的日程日历组件。
preview: /readme.png
---
```

### 预览示例

在组件文档中使用 `<Preview />` 渲染示例：

```mdx
<Preview path="calendar" type="block" className="not-prose" />
```

## 文档路径说明

| 目录 | 作用 |
| --- | --- |
| `app/(home)` | 首页与入口路由 |
| `app/docs` | 文档路由与页面布局 |
| `content/docs` | MDX 文档内容 |
| `components` | 文档站点组件 |
| `examples` | Preview 使用的示例源码 |

## 配置入口

- `fumadocs.config.ts`: 站点信息、导航与首页配置
- `source.config.ts`: MDX 源配置与 frontmatter 约束

## 组件来源

文档示例依赖 `packages/shadcn-ui` 下的组件包，并在 `examples/` 中提供可预览的示例实现。

## 文档目录说明

- `content/docs/guides`：指南与使用教程。
- `content/docs/components`：组件说明与组件总览页面。
- `content/docs/blocks`：区块/版块类文档内容。
- `content/docs/guides/changelog.mdx`：更新日志页面入口，内容来自 `CHANGELOG.md`。
- `CHANGELOG.md`：变更记录源文件。

## 布局与渲染入口

- `app/docs/layout.tsx`：使用 `fumadocs-ui` 的 DocsLayout 作为文档布局入口。
- `app/docs/[...slug]/page.tsx`：渲染 MDX 内容并注入自定义组件。
- `utils/layout.shared.tsx`：布局共享配置。
- `utils/source.ts`：内容源适配与加载器。

## 路由

| 路由                      | 说明                             |
| ------------------------- | -------------------------------- |
| `app/(home)`              | Landing 与营销页入口             |
| `app/docs`                | 文档布局与页面                   |
| `app/api/search/route.ts` | 搜索接口                         |

## Fumadocs MDX

`source.config.ts` 用于配置 MDX 选项与 frontmatter schema。
更多信息请参考 [Fumadocs MDX 文档](https://fumadocs.dev/docs/mdx)。
