# @chaos-design/shadcn-kits

用于 shadcn/ui 组件的工具函数和 Hooks 集合。

## 安装

```bash
npm install @chaos-design/shadcn-kits
```

## 使用方法

### `cn` (clsx + tailwind-merge)

用于合并 Tailwind CSS 类名。

```tsx
import { cn } from "@chaos-design/shadcn-kits";

<div className={cn("bg-red-500", className)} />
```

### `useMobile`

用于检测移动端设备的 Hook。

```tsx
import { useIsMobile } from "@chaos-design/shadcn-kits";

const isMobile = useIsMobile();
```
