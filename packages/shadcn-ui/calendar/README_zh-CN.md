# @chaos-design/calendar

一个功能完整的日历调度组件，兼容 shadcn/ui。

## 安装

### 通过包管理器安装

```bash
npm install @chaos-design/calendar
# 或
pnpm add @chaos-design/calendar
# 或
yarn add @chaos-design/calendar
```

### 依赖

该组件依赖于 `date-fns`、`lucide-react`、`react-day-picker` 以及标准的 shadcn/ui 工具库。

## 使用方法

### 引入样式

请确保在你的根布局或组件中引入 CSS 文件：

```tsx
import "@chaos-design/calendar/dist/es/index.css";
```

### 基础示例

```tsx
import { Calendar } from '@chaos-design/calendar';
import "@chaos-design/calendar/dist/es/index.css";
import { useState } from 'react';

export function MyCalendar() {
  const [events, setEvents] = useState([]);

  return (
    <div className="h-[800px] border rounded-lg overflow-hidden">
      <Calendar
        events={events}
        defaultView="month"
        onEventCreate={(e) => setEvents([...events, e])}
        onEventUpdate={(e) => setEvents(events.map(ev => ev.id === e.id ? e : ev))}
        onEventDelete={(id) => setEvents(events.filter(ev => ev.id !== id))}
      />
    </div>
  );
}
```

## 属性 (Props)

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `events` | `CalendarEvent[]` | `undefined` | 受控事件列表。如果提供，组件将处于受控模式。 |
| `defaultView` | `'month' \| 'week' \| 'day'` | `'month'` | 初始视图模式。 |
| `weekStart` | `'sunday' \| 'monday'` | `'monday'` | 每周起始日。 |
| `locale` | `'en' \| 'zh'` | `'en'` | 界面语言。 |
| `initialDate` | `Date` | `new Date()` | 初始聚焦日期。 |
| `onEventCreate` | `(event: CalendarEvent) => void` | - | 创建新事件时的回调。 |
| `onEventUpdate` | `(event: CalendarEvent) => void` | - | 更新事件时的回调。 |
| `onEventDelete` | `(id: string) => void` | - | 删除事件时的回调。 |

## 使用 shadcn CLI

本组件专为配合 shadcn/ui 生态系统工作而设计。虽然为了方便起见它作为 npm 包发布，但它是使用标准的 shadcn/ui 组件构建的。

要在 shadcn 项目中使用它，请确保安装了必要的基础组件：

```bash
npx shadcn-ui@latest add button dialog input label popover select switch textarea
```
