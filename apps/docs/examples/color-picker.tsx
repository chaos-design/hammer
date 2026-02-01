"use client";

import { ColorPicker } from "@chaos-design/color-picker";
import { useState } from "react";

const randomHex = () =>
  `#${Math.floor(Math.random() * 0xffffff)
    .toString(16)
    .padStart(6, "0")}`;

export function ColorPickerDemo() {
  const [color, setColor] = useState(() => randomHex());

  return (
    <div className="flex flex-col items-center justify-center p-4 gap-4">
      <div className="flex items-center gap-2">
        <div
          className="w-8 h-8 rounded border shadow-sm"
          style={{ backgroundColor: color }}
        />
        <div className="text-sm font-mono">{color}</div>
      </div>

      <div className="rounded-md border p-4 bg-white dark:bg-zinc-950 shadow-sm">
        <ColorPicker
          color={color}
          onChange={setColor}
          onBack={() => { }}
        />
      </div>
    </div>
  );
}

export default ColorPickerDemo;
