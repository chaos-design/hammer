# @chaos-design/shadcn-kits

A collection of utilities and hooks for shadcn/ui components.

## Installation

```bash
npm install @chaos-design/shadcn-kits
```

## Usage

### `cn` (clsx + tailwind-merge)

```tsx
import { cn } from "@chaos-design/shadcn-kits";

<div className={cn("bg-red-500", className)} />
```

### `useMobile`

```tsx
import { useIsMobile } from "@chaos-design/shadcn-kits";

const isMobile = useIsMobile();
```
