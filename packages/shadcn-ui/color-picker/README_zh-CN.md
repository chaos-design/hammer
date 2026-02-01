# @chaos-design/color-picker

一个功能强大的颜色选择器组件，支持 HEX、RGB 和 HSB 格式，并支持透明度（Alpha）调节。基于 React 和 Tailwind CSS 构建。

## 安装

### 通过包管理器安装

```bash
npm install @chaos-design/color-picker
# 或
pnpm add @chaos-design/color-picker
# 或
yarn add @chaos-design/color-picker
```

### 依赖

该组件依赖于 `lucide-react`、`@radix-ui/react-select` 以及 shadcn/ui 组件（`Input`、`Select`）。

## 使用方法

### 引入样式

请确保在你的根布局或组件中引入 CSS 文件：

```tsx
import "@chaos-design/color-picker/dist/es/index.css";
```

### 基础示例

```tsx
import * as React from "react";
import { CustomColorPicker } from "@chaos-design/color-picker";

export function ColorPickerDemo() {
  const [color, setColor] = React.useState("#000000");

  return (
    <div className="p-4 border rounded-md max-w-sm space-y-4">
      <div className="flex items-center gap-2">
        <div 
          className="w-8 h-8 rounded border shadow-sm" 
          style={{ backgroundColor: color }}
        />
        <span className="font-mono text-sm">{color}</span>
      </div>
      
      <CustomColorPicker
        color={color}
        onChange={setColor}
        onBack={() => console.log('Back clicked')}
      />
    </div>
  );
}
```

## 属性 (Props)

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `color` | `string` | 当前颜色值（HEX 字符串，例如 "#FF0000"）。 |
| `onChange` | `(color: string) => void` | 颜色改变时的回调函数。返回新的 HEX 字符串。 |
| `onBack` | `() => void` | 可选的返回按钮回调（如果已实现）。 |
