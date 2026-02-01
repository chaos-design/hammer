# @chaos-design/calendar

A full-featured calendar scheduler component compatible with shadcn/ui.

## Installation

### Install via package manager

```bash
npm install @chaos-design/calendar
# or
pnpm add @chaos-design/calendar
# or
yarn add @chaos-design/calendar
```

### Dependencies

This component relies on `date-fns`, `lucide-react`, `react-day-picker` and standard shadcn/ui utilities.

## Usage

### Import styles

Ensure you import the CSS file in your root layout or component:

```tsx
import "@chaos-design/calendar/dist/es/index.css";
```

### Basic Example

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

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `events` | `CalendarEvent[]` | `undefined` | Controlled events list. If provided, the component is controlled. |
| `defaultView` | `'month' \| 'week' \| 'day'` | `'month'` | Initial view mode. |
| `weekStart` | `'sunday' \| 'monday'` | `'monday'` | Start day of the week. |
| `locale` | `'en' \| 'zh'` | `'en'` | UI language. |
| `initialDate` | `Date` | `new Date()` | Initial focus date. |
| `onEventCreate` | `(event: CalendarEvent) => void` | - | Callback when a new event is created. |
| `onEventUpdate` | `(event: CalendarEvent) => void` | - | Callback when an event is updated. |
| `onEventDelete` | `(id: string) => void` | - | Callback when an event is deleted. |

## Using with shadcn CLI

This component is designed to work within the shadcn/ui ecosystem. While it is distributed as an npm package for convenience, it is built using standard shadcn/ui components.

To use it in a shadcn project, ensure you have the necessary base components installed:

```bash
npx shadcn-ui@latest add button dialog input label popover select switch textarea
```
