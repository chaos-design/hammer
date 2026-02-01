# Hammer Docs Site

## Overview

This directory hosts the Hammer documentation site, built with Next.js and Fumadocs. It documents base and business components with guides and examples.

## Quick Start

### Requirements

- Node.js 18+
- pnpm 8+

### Install Dependencies

```bash
pnpm install
```

### Local Development

```bash
pnpm run dev
```

Default URL: http://localhost:3460

### Production Build

```bash
pnpm run build
pnpm run start
```

## Writing Docs

### Content Location

All MDX documents live under `content/docs`. The folder structure maps directly to routes.

### Components Overview

The components overview page uses the built-in `<ComponentsOverview />` to auto-generate cards. Provide a preview image via frontmatter:

```mdx
---
title: Calendar
description: Calendar component with month/week/day views and event editing.
preview: /readme.png
---
```

### Example Preview

Use `<Preview />` in component docs to render runnable examples:

```mdx
<Preview path="calendar" type="block" className="not-prose" />
```

## Docs Path Reference

| Path | Purpose |
| --- | --- |
| `app/(home)` | Marketing landing pages and entry routes |
| `app/docs` | Docs routes and page layout |
| `content/docs` | MDX documentation content |
| `components` | Docs site UI components |
| `examples` | Example source used by Preview |

## Configuration

- `fumadocs.config.ts`: Site metadata, navigation, and home configuration
- `source.config.ts`: MDX source settings and frontmatter constraints

## Component Sources

Docs examples rely on the packages under `packages/shadcn-ui`, with runnable examples in `examples/`.

## Documentation Content

- `content/docs/guides`: Guides and how-to documentation.
- `content/docs/components`: Component documentation and overview pages.
- `content/docs/blocks`: Blocks/sections documentation.
- `content/docs/guides/changelog.mdx`: Changelog page entry sourced from `CHANGELOG.md`.
- `CHANGELOG.md`: Changelog source file.

## Layout and Rendering

- `app/docs/layout.tsx`: Docs layout entry using `fumadocs-ui` DocsLayout.
- `app/docs/[...slug]/page.tsx`: Renders MDX content and injects custom components.
- `utils/layout.shared.tsx`: Shared layout configuration.
- `utils/source.ts`: Content source adapter and loader.

## Routes

| Route                     | Description                     |
| ------------------------- | ------------------------------- |
| `app/(home)`              | Landing and marketing pages.    |
| `app/docs`                | Documentation layout and pages. |
| `app/api/search/route.ts` | Search API handler.             |

## Fumadocs MDX

`source.config.ts` configures MDX options and frontmatter schema.
Read the [Fumadocs MDX docs](https://fumadocs.dev/docs/mdx) for details.
