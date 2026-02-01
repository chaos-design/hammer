# @chaos-design/color-picker

A powerful color picker component supporting HEX, RGB, and HSB formats with transparency (alpha) support. Built with React and Tailwind CSS.

## Installation

### Install via package manager

```bash
npm install @chaos-design/color-picker
# or
pnpm add @chaos-design/color-picker
# or
yarn add @chaos-design/color-picker
```

### Dependencies

This component relies on `lucide-react`, `@radix-ui/react-select`, and shadcn/ui components (`Input`, `Select`).

## Usage

### Import styles

Ensure you import the CSS file in your root layout or component:

```tsx
import "@chaos-design/color-picker/dist/es/index.css";
```

### Basic Example

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

## Props

| Prop | Type | Description |
|Str |Str |Str |
| `color` | `string` | The current color value (HEX string, e.g., "#FF0000"). |
| `onChange` | `(color: string) => void` | Callback fired when the color changes. Returns the new HEX string. |
| `onBack` | `() => void` | Optional callback for a back button (if implemented). |
