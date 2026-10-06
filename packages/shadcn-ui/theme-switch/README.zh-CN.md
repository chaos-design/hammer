# @chaos-design/theme-switch

[English](./README.md)

一个 shadcn/ui 主题切换组件：一个方形图标按钮，点击弹出 `浅色` / `深色` / `跟随系统` 菜单——与 Claude 文档站的风格保持一致。基于 React、Tailwind CSS、Radix 与 [lucide-react](https://lucide.dev) 构建。

## 安装

```bash
npm install @chaos-design/theme-switch
# 或
pnpm add @chaos-design/theme-switch
```

`react` 和 `react-dom`（18 或 19）是 peer dependencies。`@radix-ui/react-dropdown-menu`、`lucide-react`、`clsx`、`tailwind-merge` 为普通依赖；构建产物会将它们标记为 external，因此发布包只包含自身代码（JS 约 2.8 KB gzip，CSS 约 1.5 KB gzip）。

### 引入样式

```tsx
import '@chaos-design/theme-switch/dist/es/index.css';
```

该样式表仅包含 Tailwind *utilities*，不含 preflight，引入它不会重置你的应用全局样式。

## 使用

```tsx
import * as React from 'react';
import { ThemeSwitch } from '@chaos-design/theme-switch';

export function ThemeSwitchDemo() {
  return <ThemeSwitch />;
}
```

非受控模式下，组件会把选择持久化到 `localStorage`，并对 `document.documentElement` 写入 `.dark` class 与 `color-scheme`。选中“跟随系统”时会实时跟随系统主题。

### 避免首屏闪烁

在服务端渲染页面的最前面（如 `<head>` 中）渲染无闪烁脚本：

```tsx
import { ThemeScript } from '@chaos-design/theme-switch';

export function Root() {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body>...</body>
    </html>
  );
}
```

`ThemeScript` 只输出一段短于 300 字节的内联脚本，它的参数（storageKey、默认主题、attribute 策略）与组件保持一致。如果只在客户端渲染它则不会执行；此时组件会在 layout effect 中补应用主题，至多造成一帧未绘制。

```ts
// 也可以自己生成脚本字符串，用于纯 HTML 模板：
import { themeScript } from '@chaos-design/theme-switch';
const code = themeScript({ storageKey: 'theme', defaultTheme: 'system' });
```

### 受控用法

```tsx
const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');

<ThemeSwitch value={theme} onValueChange={setTheme} />
```

传入 `value` 时，组件仍会应用主题（它是 UI 控件，不只是状态），但持久化与多实例同步由父组件自行负责。

## Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | ---- | ------ | ---- |
| `value` | `'light' \| 'dark' \| 'system'` | — | 受控主题。 |
| `defaultTheme` | `Theme` | `'system'` | 无存储时的初始主题。 |
| `onValueChange` | `(theme: Theme) => void` | — | 切换主题时的回调。 |
| `storageKey` | `string` | `'theme'` | 同页面所有开关共用的 `localStorage` 键。 |
| `enableSystem` | `boolean` | `true` | 只做明暗两套主题时可关掉 `System`。 |
| `attribute` | `'class' \| 'data-theme'` | `'class'` | 主题写入文档根节点的方式。 |
| `disableTransitionOnChange` | `boolean` | `true` | 切换时临时禁用 CSS 过渡。 |
| `labels` | `Partial<Record<Theme, string>>` | — | 各项文本（国际化）。 |
| `icons` | `Partial<Record<Theme, ComponentType>>` | — | 各项图标（默认 lucide `Sun`/`Moon`/`Monitor`）。 |
| `triggerLabel` | `string` | — | 触发按钮的 `aria-label`（默认 `Color theme: <当前>`）。 |
| `className` | `string` | — | 触发按钮的 class。 |
| `classNames` | `ThemeSwitchClassNames` | — | 各槽位的 class 覆盖。 |

### `classNames`

| 键 | 目标 |
| --- | ---- |
| `trigger` | 方形触发按钮 |
| `content` | 浮层菜单 |
| `item` | `Light` / `Dark` / `System` 菜单项 |
| `icon` | 菜单项与触发按钮的前置图标 |

## 行为说明

- **图标表达当前状态。** 触发按钮显示选中项对应的图标，`aria-label` 为 `Color theme: <当前>`，与 Claude 文档站一致。
- **`System` 实时跟随。** 选中“跟随系统”时创建 media query 监听并随系统切换；一旦改为显式主题即移除监听，不做空转。
- **多开关、多标签页同步。** 同一页面内所有开关共用同一 storage 槽；跨标签页由浏览器的 `storage` 事件同步。
- **不闪烁、不渐变。** `ThemeScript` 在首次绘制前写好主题；`disableTransitionOnChange` 在切换瞬间临时禁用过渡，避免整页动画。
- **存储不可用。** 隐私模式下 `localStorage` 会抛错，组件会捕获并在会话内继续工作（只是无法持久化）。

## License

[MIT](../../../LICENSE)
