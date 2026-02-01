# @chaos-design/babel-plugin-jsx-source-location

一个 Babel 插件，用于将源文件位置（文件路径、行号、列号）作为 `data-source-loc` 属性添加到 JSX 元素中。这对于需要将 DOM 元素映射回源代码的开发工具（例如“点击跳转到组件”功能）非常有用。

## 安装

```bash
pnpm add -D @chaos-design/babel-plugin-jsx-source-location
```

## 选项

| 选项 | 类型 | 默认值 | 描述 |
| --- | --- | --- | --- |
| `attributeName` | `string` | `"data-source-loc"` | 添加到 JSX 元素的属性名称。 |

## 使用

### 在 Vite 中（配合 @vitejs/plugin-react）

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import jsxSourceLocation from '@chaos-design/babel-plugin-jsx-source-location';

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [
            [jsxSourceLocation, { attributeName: 'data-custom-loc' }]
        ],
      },
    }),
  ],
});
```

### 在 Babel 配置中

```json
{
  "plugins": [
    ["@chaos-design/babel-plugin-jsx-source-location", { "attributeName": "data-custom-loc" }]
  ]
}
```

## 结果

输入：

```jsx
<Button>Click me</Button>
```

输出：

```jsx
<Button data-source-loc="/src/components/Button.tsx:10:5">Click me</Button>
```
