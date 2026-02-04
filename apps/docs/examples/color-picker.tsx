'use client';

import { ColorPicker } from '@chaos-design/color-picker';
import { useId, useState } from 'react';

// const seedToHex = (seed: string) => {
//   let hash = 0;
//   for (let i = 0; i < seed.length; i += 1) {
//     hash = (hash * 31 + seed.charCodeAt(i)) | 0;
//   }
//   const value = (hash >>> 0) % 0xffffff;
//   return `#${value.toString(16).padStart(6, '0')}`;
// };

export function ColorPickerDemo() {
  const seed = useId();
  const [color, setColor] = useState('#123456');

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
        <ColorPicker color={color} onChange={setColor} onBack={() => {}} />
      </div>
    </div>
  );
}

export default ColorPickerDemo;
