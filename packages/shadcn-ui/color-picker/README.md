# @chaos-design/color-picker

[简体中文](./README.zh-CN.md)

A colour picker supporting HEX, RGB and HSB input, with saturation/brightness
area dragging, hue and opacity sliders, and keyboard steppers. Built with React
and Tailwind CSS.

## Installation

```bash
npm install @chaos-design/color-picker
# or
pnpm add @chaos-design/color-picker
```

This component is **controlled**: it renders the colour passed through `color`
and reports changes through `onChange`.

`react` and `react-dom` (18 or 19) are peer dependencies. `date-fns`,
`clsx` and `tailwind-merge` come along as transitive dependencies.

### Import styles

```tsx
import '@chaos-design/color-picker/dist/es/index.css';
```

## Usage

```tsx
import * as React from 'react';
import { ColorPicker } from '@chaos-design/color-picker';

export function ColorPickerDemo() {
  const [color, setColor] = React.useState('#3b82f6');

  return (
    <div className="space-y-4 border rounded-md p-4 max-w-sm">
      <div className="flex items-center gap-2">
        <div
          className="w-8 h-8 rounded border shadow-sm"
          style={{ backgroundColor: color }}
        />
        <span className="font-mono text-sm">{color}</span>
      </div>

      <ColorPicker color={color} onChange={setColor} />
    </div>
  );
}
```

## Props

| Prop        | Type                       | Default | Description                                       |
| ----------- | -------------------------- | ------- | ------------------------------------------------- |
| `color`     | `string`                   | —       | Current colour as a hex string, e.g. `'#3b82f6'`. |
| `onChange`  | `(color: string) => void`  | —       | Called with the new hex string on every change.   |
| `className` | `string`                   | —       | Class applied to the root element.                |
| `classNames`| `ColorPickerClassNames`    | —       | Per-slot class overrides.                         |

### `classNames`

| Key             | Targets                                     |
| --------------- | ------------------------------------------- |
| `sbContainer`   | Saturation/brightness area                  |
| `slidersContainer` | Row wrapping the sliders and preview    |
| `hueSlider`     | Hue slider                                  |
| `opacitySlider` | Opacity slider                              |
| `preview`       | Current-colour swatch                       |
| `inputsContainer` | Row wrapping the format select and inputs |
| `formatSelect`  | RGB / HEX / HSB select                      |
| `hexInput`      | Hex text input                              |
| `rgbInput`      | R, G and B text inputs                      |
| `hsbInput`      | H, S and B text inputs                      |
| `opacityInput`  | Opacity text input                          |

## Colour utilities

The conversion helpers used internally are also exported from the package entry,
so they can be reused and unit tested independently:

```ts
import {
  hexToHsb,
  hsbToHex,
  hsbToRgb,
  rgbToHsb,
} from '@chaos-design/color-picker';
```

| Function                 | Behaviour                                                             |
| ------------------------ | --------------------------------------------------------------------- |
| `hexToHsb(hex)`          | Parses `#abc`, `abc`, `#aabbcc`, `aabbcc`. Unparseable input returns black — never `NaN`. |
| `hsbToHex(h, s, b)`      | `h` is 0-360, `s`/`b` are 0-100. Saturates and brightness clamp; hue wraps. |
| `hsbToRgb(h, s, b)`      | Returns `{ r, g, b }`, each 0-255.                                     |
| `rgbToHsb(rgb)`          | The inverse of `hsbToRgb`.                                            |

## Interaction notes

- **Typing** — a field owns its text while focused, so a half-typed value is not
  overwritten mid-keystroke. Blurring hands the value back to the component.
- **Arrow keys** — step the focused field by 1, or 10 with <kbd>Shift</kbd>.
  Hue wraps around at 360 and RGB wraps at 256; saturation and brightness clamp.
- **Dragging labels** — dragging an `R`/`G`/`B`/`H`/`S`/`B`/`%` label changes that
  channel; hold <kbd>Shift</kbd> to move faster.

## License

[MIT](../../../LICENSE)