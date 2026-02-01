# @chaos-design/month-datepicker

一个可定制的月份和年份选择器组件，基于 React 和 Tailwind CSS 构建，兼容 shadcn/ui 生态系统。

## 安装

### 通过包管理器安装

```bash
npm install @chaos-design/month-datepicker
# 或
pnpm add @chaos-design/month-datepicker
# 或
yarn add @chaos-design/month-datepicker
```

### 依赖

该组件依赖于 `date-fns`、`lucide-react` 以及标准的 shadcn/ui 工具库（`cn`、`Button`）。

## 使用方法

### 引入样式

请确保在你的根布局或组件中引入 CSS 文件：

```tsx
import "@chaos-design/month-datepicker/dist/es/index.css";
```

### 基础示例

```tsx
import * as React from "react";
import { MonthDatepicker } from "@chaos-design/month-datepicker";
import { enUS } from "date-fns/locale";

export function DatePickerDemo() {
  const [date, setDate] = React.useState<Date>(new Date());

  return (
    <div className="p-4 border rounded-md max-w-sm">
      <div className="mb-4 text-sm font-medium">
        已选：{date.toLocaleDateString()}
      </div>
      <MonthDatepicker
        currentDate={date}
        onMonthSelect={setDate}
        locale={enUS}
      />
    </div>
  );
}
```

## 属性 (Props)

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `currentDate` | `Date` | 当前选中的日期（控制显示的年份/月份）。 |
| `onMonthSelect` | `(date: Date) => void` | 选择月份时的回调函数。 |
| `locale` | `Locale` | date-fns 的 locale 对象，用于本地化。 |
