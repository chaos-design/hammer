'use client';

import './index.css';
import { cn } from '@chaos-design/shadcn-kits';
import React, { useEffect, useRef, useState } from 'react';
import { Input } from './components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './components/ui/select';
import { hexToHsb, hsbToHex, hsbToRgb } from './utils/transform';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  onBack?: () => void;
  className?: string;
  classNames?: {
    sbContainer?: string;
    slidersContainer?: string;
    hueSlider?: string;
    opacitySlider?: string;
    preview?: string;
    inputsContainer?: string;
    formatSelect?: string;
    hexInput?: string;
    rgbInput?: string;
    hsbInput?: string;
    opacityInput?: string;
  };
}

export function ColorPicker({
  color,
  onChange,
  className,
  classNames,
}: ColorPickerProps) {
  // Initialize state with props
  const [hsb, setHsb] = useState(hexToHsb(color));
  const [opacity, setOpacity] = useState(100);
  const COLOR_FORMATS = ['RGB', 'HEX', 'HSB'] as const;
  type ColorFormat = (typeof COLOR_FORMATS)[number];

  const [inputType, setInputType] = useState<ColorFormat>(COLOR_FORMATS[0]);
  const [isDraggingSB, setIsDraggingSB] = useState(false);
  const sbRef = useRef<HTMLDivElement>(null);

  // Track the source of the last update to prevent circular dependency fighting
  // 'hex' | 'rgb' | 'hsb' | 'sb' | 'slider' | null
  const lastUpdateSource = useRef<string | null>(null);
  const lastEmittedHex = useRef<string | null>(null);

  const [hexInput, setHexInput] = useState(color.replace(/^#/, ''));
  const [rgbInput, setRgbInput] = useState(
    hsbToRgb(hexToHsb(color).h, hexToHsb(color).s, hexToHsb(color).b),
  );
  const [hsbInput, setHsbInput] = useState({
    h: hexToHsb(color).h,
    s: hexToHsb(color).s,
    b: hexToHsb(color).b,
  });
  const [opacityInput, setOpacityInput] = useState(opacity.toString());

  // Sync state when color prop changes externally
  useEffect(() => {
    // Only update if the color actually corresponds to a different value to avoid loops
    const currentHex = hsbToHex(hsb.h, hsb.s, hsb.b);
    if (color.toLowerCase() !== currentHex.toLowerCase()) {
      // Prevent circular updates if the incoming color matches what we just emitted
      if (
        lastEmittedHex.current &&
        color.toLowerCase() === lastEmittedHex.current.toLowerCase()
      ) {
        lastEmittedHex.current = null;
        return;
      }

      const newHsb = hexToHsb(color);
      setHsb(newHsb);
      lastUpdateSource.current = 'external';
      setHexInput(color.replace(/^#/, ''));
      setRgbInput(hsbToRgb(newHsb.h, newHsb.s, newHsb.b));
      setHsbInput(newHsb);
    }
  }, [color, hsb]);

  // Sync internal inputs when sliders change
  useEffect(() => {
    if (lastUpdateSource.current !== 'hex') {
      setHexInput(hsbToHex(hsb.h, hsb.s, hsb.b).replace(/^#/, ''));
    }
    if (lastUpdateSource.current !== 'rgb') {
      setRgbInput(hsbToRgb(hsb.h, hsb.s, hsb.b));
    }
    if (lastUpdateSource.current !== 'hsb') {
      setHsbInput(hsb);
    }
    // Reset after sync (optional, but good for safety)
    lastUpdateSource.current = null;
  }, [hsb]);

  useEffect(() => {
    setOpacityInput(opacity.toString());
  }, [opacity]);

  const handleSBChange = React.useCallback(
    (clientX: number, clientY: number) => {
      if (!sbRef.current) return;
      const rect = sbRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));

      // x corresponds to Saturation (0-100)
      // y corresponds to Brightness (100-0)
      const newS = Math.round(x * 100);
      const newB = Math.round((1 - y) * 100);

      const newHsb = { ...hsb, s: newS, b: newB };
      lastUpdateSource.current = 'sb';
      setHsb(newHsb);
      onChange(hsbToHex(newHsb.h, newHsb.s, newHsb.b));
    },
    [hsb, onChange],
  );

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDraggingSB(true);
    handleSBChange(e.clientX, e.clientY);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingSB) {
        handleSBChange(e.clientX, e.clientY);
      }
    };
    const handleMouseUp = () => {
      setIsDraggingSB(false);
    };

    if (isDraggingSB) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingSB, handleSBChange]);

  const hexColor = hsbToHex(hsb.h, hsb.s, hsb.b);
  // rgbColor is not used in rendering anymore since we use rgbInput state for input fields
  // const rgbColor = hsbToRgb(hsb.h, hsb.s, hsb.b);

  const onHexChange = (value: string) => {
    lastUpdateSource.current = 'hex';
    setHexInput(value);
    if (/^#?[0-9A-Fa-f]{6}$/.test(value)) {
      const cleanHex = value.startsWith('#') ? value : `#${value}`;
      const newHsb = hexToHsb(cleanHex);
      setHsb(newHsb);
      onChange(cleanHex);
    }
  };

  const onRgbChange = (key: 'r' | 'g' | 'b', value: string) => {
    // Allow empty string for better editing experience
    lastUpdateSource.current = 'rgb';
    const newRgbInput = { ...rgbInput, [key]: value };
    setRgbInput(newRgbInput);

    // Only update global color if ALL inputs are valid numbers
    const rVal = parseInt(String(newRgbInput.r), 10);
    const gVal = parseInt(String(newRgbInput.g), 10);
    const bVal = parseInt(String(newRgbInput.b), 10);

    if (
      !isNaN(rVal) &&
      !isNaN(gVal) &&
      !isNaN(bVal) &&
      String(newRgbInput.r) !== '' &&
      String(newRgbInput.g) !== '' &&
      String(newRgbInput.b) !== ''
    ) {
      const r = Math.max(0, Math.min(255, rVal));
      const g = Math.max(0, Math.min(255, gVal));
      const b = Math.max(0, Math.min(255, bVal));

      const toHex = (n: number) => {
        const h = Math.round(n).toString(16);
        return h.length === 1 ? `0${h}` : h;
      };
      const newHex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;

      lastEmittedHex.current = newHex;
      setHsb(hexToHsb(newHex));
      onChange(newHex);
    }
  };

  const onHsbChange = (key: 'h' | 's' | 'b', value: string) => {
    // Allow empty string for better editing experience
    lastUpdateSource.current = 'hsb';
    const newHsbInput = { ...hsbInput, [key]: value };
    setHsbInput(newHsbInput);

    if (value === '') return;

    const val = parseInt(value, 10);
    if (!Number.isNaN(val)) {
      const limit = key === 'h' ? 360 : 100;
      const clamped = Math.max(0, Math.min(limit, val));

      const h = key === 'h' ? clamped : parseInt(String(hsbInput.h), 10) || 0;
      const s = key === 's' ? clamped : parseInt(String(hsbInput.s), 10) || 0;
      const b = key === 'b' ? clamped : parseInt(String(hsbInput.b), 10) || 0;

      const newHsb = { h, s, b };
      setHsb(newHsb);
      onChange(hsbToHex(h, s, b));
    }
  };

  const onOpacityChange = (value: string) => {
    setOpacityInput(value);
    if (value === '') return;
    const val = parseInt(value, 10);
    if (!Number.isNaN(val)) {
      setOpacity(Math.max(0, Math.min(100, val)));
    }
  };

  const handleOpacityKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      const step = (e.key === 'ArrowUp' ? 1 : -1) * (e.shiftKey ? 10 : 1);
      const current = parseInt(opacityInput, 10) || 0;
      const next = Math.max(0, Math.min(100, current + step));
      onOpacityChange(next.toString());
    }
  };

  const handleRgbKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    key: 'r' | 'g' | 'b',
  ) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      const step = (e.key === 'ArrowUp' ? 1 : -1) * (e.shiftKey ? 10 : 1);
      const current = parseInt(String(rgbInput[key]), 10) || 0;

      // Wrap around logic for RGB (0-255)
      let next = (current + step) % 256;
      if (next < 0) next += 256;

      onRgbChange(key, next.toString());
    }
  };

  const handleHsbKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    key: 'h' | 's' | 'b',
  ) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      const step = (e.key === 'ArrowUp' ? 1 : -1) * (e.shiftKey ? 10 : 1);
      const current = parseInt(String(hsbInput[key]), 10) || 0;

      if (key === 'h') {
        // Wrap around logic for Hue (0-359)
        let next = (current + step) % 360;
        if (next < 0) next += 360;
        onHsbChange(key, next.toString());
      } else {
        const limit = 100;
        const next = Math.max(0, Math.min(limit, current + step));
        onHsbChange(key, next.toString());
      }
    }
  };

  const handleLabelDrag = (
    e: React.MouseEvent,
    type: 'r' | 'g' | 'b' | 'h' | 's' | 'b' | 'opacity',
  ) => {
    e.preventDefault();
    const startX = e.clientX;
    const startValue =
      type === 'opacity'
        ? parseInt(opacityInput, 10) || 0
        : ['h', 's', 'b'].includes(type)
          ? parseInt(String(hsbInput[type as keyof typeof hsbInput]), 10) || 0
          : parseInt(String(rgbInput[type as keyof typeof rgbInput]), 10) || 0;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const diff = moveEvent.clientX - startX;
      const step = Math.round(diff * (moveEvent.shiftKey ? 2 : 1));
      const newValue = startValue + step;

      if (type === 'opacity') {
        const clamped = Math.max(0, Math.min(100, newValue));
        onOpacityChange(clamped.toString());
      } else if (['r', 'g', 'b'].includes(type)) {
        const clamped = Math.max(0, Math.min(255, newValue));
        onRgbChange(type as 'r' | 'g' | 'b', clamped.toString());
      } else {
        const limit = type === 'h' ? 360 : 100;
        const clamped = Math.max(0, Math.min(limit, newValue));
        onHsbChange(type as 'h' | 's' | 'b', clamped.toString());
      }
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
    };

    document.body.style.cursor = 'ew-resize';
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div className={cn('w-[280px] space-y-3', className)}>
      {/* Saturation/Brightness Area */}
      <div
        ref={sbRef}
        className={cn(
          'relative h-40 w-full rounded-lg cursor-crosshair overflow-hidden shadow-sm border border-zinc-200 dark:border-zinc-700',
          classNames?.sbContainer,
        )}
        style={{
          backgroundColor: `hsl(${hsb.h}, 100%, 50%)`,
          backgroundImage: `
            linear-gradient(to top, #000, transparent),
            linear-gradient(to right, #fff, transparent)
          `,
        }}
        onMouseDown={handleMouseDown}
      >
        <div
          className="absolute w-3 h-3 rounded-full border-2 border-white shadow-sm -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{
            left: `${hsb.s}%`,
            top: `${100 - hsb.b}%`,
            backgroundColor: hexColor,
          }}
        />
      </div>

      <div
        className={cn('flex gap-2 items-center', classNames?.slidersContainer)}
      >
        {/* Sliders */}
        <div className="flex-1 space-y-2">
          {/* Hue Slider */}
          <div
            className={cn(
              'h-3 rounded-full relative overflow-hidden',
              classNames?.hueSlider,
            )}
          >
            <input
              type="range"
              min="0"
              max="360"
              value={hsb.h}
              onChange={(e) => {
                const newH = Number(e.target.value);
                const newHsb = { ...hsb, h: newH };
                lastUpdateSource.current = 'slider';
                setHsb(newHsb);
                onChange(hsbToHex(newHsb.h, newHsb.s, newHsb.b));
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div
              className="w-full h-full rounded-full"
              style={{
                background:
                  'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)',
              }}
            />
            <div
              className="absolute top-0 bottom-0 w-3 h-3 bg-white rounded-full border border-zinc-300 shadow-sm pointer-events-none -translate-x-1/2"
              style={{ left: `${(hsb.h / 360) * 100}%` }}
            />
          </div>

          {/* Opacity Slider */}
          <div
            className={cn(
              "h-3 rounded-full relative overflow-hidden bg-zinc-100 dark:bg-zinc-800 bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMUlEQVQ4T2NkYGAQYcAP3uCTZhw1gGGYhAGBZIA/nYDCgBDAm9BGDWAAJyRCgLaBCAAgXwixzAS0pgAAAABJRU5ErkJggg==')]",
              classNames?.opacitySlider,
            )}
          >
            <input
              type="range"
              min="0"
              max="100"
              value={opacity}
              onChange={(e) => setOpacity(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div
              className="w-full h-full rounded-full"
              style={{
                background: `linear-gradient(to right, transparent, ${hexColor})`,
              }}
            />
            <div
              className="absolute top-0 bottom-0 w-3 h-3 bg-white rounded-full border border-zinc-300 shadow-sm pointer-events-none -translate-x-1/2"
              style={{ left: `${opacity}%` }}
            />
          </div>
        </div>

        {/* Current Color Preview */}
        <div
          className={cn(
            'w-8 h-8 rounded-md border border-zinc-200 dark:border-zinc-700 shadow-sm shrink-0',
            classNames?.preview,
          )}
          style={{ backgroundColor: hexColor }}
        />
      </div>

      {/* Input Values */}
      <div className={cn('flex gap-1.5', classNames?.inputsContainer)}>
        <div className={cn('w-[60px] shrink-0', classNames?.formatSelect)}>
          <Select
            value={inputType}
            onValueChange={(v) => setInputType(v as ColorFormat)}
          >
            <SelectTrigger className="h-7 text-xs px-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {COLOR_FORMATS.map((format) => (
                <SelectItem key={format} value={format}>
                  {format}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 flex gap-1.5">
          {inputType === 'HEX' && (
            <>
              <div className="relative flex-1">
                <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-xs text-zinc-500">
                  #
                </span>
                <Input
                  value={hexInput}
                  onChange={(e) => onHexChange(e.target.value)}
                  className={cn(
                    'h-7 text-xs font-mono uppercase pl-3 pr-1',
                    classNames?.hexInput,
                  )}
                />
              </div>
              <div className="relative w-[42px] shrink-0">
                <Input
                  value={opacityInput}
                  onChange={(e) => onOpacityChange(e.target.value)}
                  onKeyDown={handleOpacityKeyDown}
                  className={cn(
                    'h-7 text-xs px-1 text-center pr-2',
                    classNames?.opacityInput,
                  )}
                />
                <span
                  className="absolute right-0.5 top-1/2 -translate-y-1/2 text-[9px] text-zinc-500 cursor-ew-resize select-none"
                  onMouseDown={(e) => handleLabelDrag(e, 'opacity')}
                >
                  %
                </span>
              </div>
            </>
          )}
          {inputType === 'RGB' && (
            <>
              <div className="flex gap-1 w-full">
                <div className="flex-1 relative">
                  <Input
                    value={rgbInput.r}
                    onChange={(e) => onRgbChange('r', e.target.value)}
                    onKeyDown={(e) => handleRgbKeyDown(e, 'r')}
                    className={cn(
                      'h-7 text-xs px-0.5 text-center',
                      classNames?.rgbInput,
                    )}
                  />
                  <span
                    className="absolute bottom-[-10px] left-0 w-full text-[8px] text-center text-zinc-400 cursor-ew-resize select-none"
                    onMouseDown={(e) => handleLabelDrag(e, 'r')}
                  >
                    R
                  </span>
                </div>
                <div className="flex-1 relative">
                  <Input
                    value={rgbInput.g}
                    onChange={(e) => onRgbChange('g', e.target.value)}
                    onKeyDown={(e) => handleRgbKeyDown(e, 'g')}
                    className={cn(
                      'h-7 text-xs px-0.5 text-center',
                      classNames?.rgbInput,
                    )}
                  />
                  <span
                    className="absolute bottom-[-10px] left-0 w-full text-[8px] text-center text-zinc-400 cursor-ew-resize select-none"
                    onMouseDown={(e) => handleLabelDrag(e, 'g')}
                  >
                    G
                  </span>
                </div>
                <div className="flex-1 relative">
                  <Input
                    value={rgbInput.b}
                    onChange={(e) => onRgbChange('b', e.target.value)}
                    onKeyDown={(e) => handleRgbKeyDown(e, 'b')}
                    className={cn(
                      'h-7 text-xs px-0.5 text-center',
                      classNames?.rgbInput,
                    )}
                  />
                  <span
                    className="absolute bottom-[-10px] left-0 w-full text-[8px] text-center text-zinc-400 cursor-ew-resize select-none"
                    onMouseDown={(e) => handleLabelDrag(e, 'b')}
                  >
                    B
                  </span>
                </div>
              </div>
              <div className="relative w-[42px] shrink-0">
                <Input
                  value={opacityInput}
                  onChange={(e) => onOpacityChange(e.target.value)}
                  onKeyDown={handleOpacityKeyDown}
                  className={cn(
                    'h-7 text-xs px-1 text-center pr-2',
                    classNames?.opacityInput,
                  )}
                />
                <span
                  className="absolute right-0.5 top-1/2 -translate-y-1/2 text-[9px] text-zinc-500 cursor-ew-resize select-none"
                  onMouseDown={(e) => handleLabelDrag(e, 'opacity')}
                >
                  %
                </span>
              </div>
            </>
          )}

          {inputType === 'HSB' && (
            <>
              <div className="flex gap-1 w-full">
                <div className="flex-1 relative">
                  <Input
                    value={hsbInput.h}
                    onChange={(e) => onHsbChange('h', e.target.value)}
                    onKeyDown={(e) => handleHsbKeyDown(e, 'h')}
                    className={cn(
                      'h-7 text-xs px-0.5 text-center',
                      classNames?.hsbInput,
                    )}
                  />
                  <span
                    className="absolute bottom-[-10px] left-0 w-full text-[8px] text-center text-zinc-400 cursor-ew-resize select-none"
                    onMouseDown={(e) => handleLabelDrag(e, 'h')}
                  >
                    H
                  </span>
                </div>
                <div className="flex-1 relative">
                  <Input
                    value={hsbInput.s}
                    onChange={(e) => onHsbChange('s', e.target.value)}
                    onKeyDown={(e) => handleHsbKeyDown(e, 's')}
                    className={cn(
                      'h-7 text-xs pl-0.5 pr-2 text-center',
                      classNames?.hsbInput,
                    )}
                  />
                  <span className="absolute right-0.5 top-1/2 -translate-y-1/2 text-[9px] text-zinc-500 pointer-events-none">
                    %
                  </span>
                  <span
                    className="absolute bottom-[-10px] left-0 w-full text-[8px] text-center text-zinc-400 cursor-ew-resize select-none"
                    onMouseDown={(e) => handleLabelDrag(e, 's')}
                  >
                    S
                  </span>
                </div>
                <div className="flex-1 relative">
                  <Input
                    value={hsbInput.b}
                    onChange={(e) => onHsbChange('b', e.target.value)}
                    onKeyDown={(e) => handleHsbKeyDown(e, 'b')}
                    className={cn(
                      'h-7 text-xs pl-0.5 pr-2 text-center',
                      classNames?.hsbInput,
                    )}
                  />
                  <span className="absolute right-0.5 top-1/2 -translate-y-1/2 text-[9px] text-zinc-500 pointer-events-none">
                    %
                  </span>
                  <span
                    className="absolute bottom-[-10px] left-0 w-full text-[8px] text-center text-zinc-400 cursor-ew-resize select-none"
                    onMouseDown={(e) => handleLabelDrag(e, 'b')}
                  >
                    B
                  </span>
                </div>
              </div>
              <div className="relative w-[42px] shrink-0">
                <Input
                  value={opacityInput}
                  onChange={(e) => onOpacityChange(e.target.value)}
                  onKeyDown={handleOpacityKeyDown}
                  className={cn(
                    'h-7 text-xs px-1 text-center pr-2',
                    classNames?.opacityInput,
                  )}
                />
                <span
                  className="absolute right-0.5 top-1/2 -translate-y-1/2 text-[9px] text-zinc-500 cursor-ew-resize select-none"
                  onMouseDown={(e) => handleLabelDrag(e, 'opacity')}
                >
                  %
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Back button for internal nav if needed, though popover usually just closes */}
      {/* <Button variant="ghost" size="sm" onClick={onBack} className="w-full h-7 text-xs">
        <ChevronLeft className="w-3 h-3 mr-1" /> Back to Presets
      </Button> */}
    </div>
  );
}
