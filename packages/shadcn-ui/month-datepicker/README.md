# @chaos-design/month-datepicker

A customizable month and year picker component built with React and Tailwind CSS, compatible with the shadcn/ui ecosystem.

## Installation

### Install via package manager

```bash
npm install @chaos-design/month-datepicker
# or
pnpm add @chaos-design/month-datepicker
# or
yarn add @chaos-design/month-datepicker
```

### Dependencies

This component relies on `date-fns`, `lucide-react`, and standard shadcn/ui utilities (`cn`, `Button`).

## Usage

### Import styles

Ensure you import the CSS file in your root layout or component:

```tsx
import "@chaos-design/month-datepicker/dist/es/index.css";
```

### Basic Example

```tsx
import * as React from "react";
import { MonthDatepicker } from "@chaos-design/month-datepicker";
import { enUS } from "date-fns/locale";

export function DatePickerDemo() {
  const [date, setDate] = React.useState<Date>(new Date());

  return (
    <div className="p-4 border rounded-md max-w-sm">
      <div className="mb-4 text-sm font-medium">
        Selected: {date.toLocaleDateString()}
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

## Props

| Prop | Type | Description |
|Str |Str |Str |
| `currentDate` | `Date` | The currently selected date (controls the view year/month). |
| `onMonthSelect` | `(date: Date) => void` | Callback fired when a month is selected. |
| `locale` | `Locale` | date-fns locale object for localization. |
