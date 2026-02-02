'use client';

import { Pipette } from 'lucide-react';
import { useState } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../components/ui/popover';
import { RECOMMENDED_COLOR_CLASSES } from '../../constants';
import { cn } from '../../utils';
import { ColorPicker } from './custom-color-picker';

interface ColorPickerPopoverProps {
  colorClass: string;
  onColorChange: (color: string) => void;
  strings: { colorLabel: string };
}

export function ColorPickerPopover({
  colorClass,
  onColorChange,
  strings,
}: ColorPickerPopoverProps) {
  const [view, setView] = useState<'presets' | 'custom'>('presets');
  const [open, setOpen] = useState(false);

  // Helper to get actual hex value for preview
  const getColorValue = (cls: string) => {
    if (cls.startsWith('#')) return cls;
    if (cls.startsWith('bg-[') && cls.endsWith(']')) return cls.slice(4, -1);
    // For standard tailwind classes, we can't easily get the hex without a mapping or computed style.
    // We'll rely on the class being applied for visual, but for custom picker sync we might need a default.
    return '#000000'; // Fallback
  };

  const getColorName = (cls: string) => {
    switch (cls) {
      case 'bg-[#E02020]':
        return '猩红';
      case 'bg-[#FA8c35]':
        return '橙皮';
      case 'bg-[#F2E009]':
        return '柠檬黄';
      case 'bg-[#44CEF6]':
        return '蓝';
      case 'bg-[#1FBCF5]':
        return '湖蓝';
      case 'bg-[#20A162]':
        return '葱绿';
      case 'bg-[#B15BFF]':
        return '紫';
      case 'bg-[#FF3399]':
        return '桃红';
      default:
        return '';
    }
  };

  return (
    <Popover
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) setView('presets'); // Reset view on close
      }}
    >
      <PopoverTrigger asChild>
        <div
          className={cn(
            'flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px]',
            'cursor-pointer',
            'border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800',
          )}
        >
          <span
            className={cn(
              'h-2 w-2 rounded-full',
              !colorClass.startsWith('#') && colorClass,
            )}
            style={
              colorClass.startsWith('#')
                ? { backgroundColor: colorClass }
                : undefined
            }
          />
          <span className="truncate w-[60px]">
            {colorClass.startsWith('bg-[') && colorClass.endsWith(']')
              ? colorClass.slice(4, -1)
              : colorClass.startsWith('#')
                ? colorClass
                : colorClass.replace('bg-', '')}
          </span>
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-3 rounded-xl border border-white/10 shadow-[0_0_20px_rgba(0,123,255,0.2)] backdrop-blur-xl"
        align="center"
        data-inline-editor-popup
        onPointerDownOutside={(e) => {
          const target = e.target as HTMLElement;
          if (
            target.closest('[role="listbox"]') ||
            target.closest('[data-radix-select-content]') ||
            target.closest('[data-radix-select-viewport]') ||
            target.closest('[data-radix-popper-content-wrapper]')
          ) {
            e.preventDefault();
          }
        }}
      >
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600&display=swap');
          .font-tech { font-family: 'Rajdhani', sans-serif; }
        `}</style>

        {view === 'custom' ? (
          <ColorPicker
            className=""
            color={getColorValue(colorClass)}
            onChange={onColorChange}
            onBack={() => setView('presets')}
          />
        ) : (
          <div className="relative flex h-[180px] w-[180px] items-center justify-center">
            {/* Decorative tech rings */}
            <div className="absolute inset-0 rounded-full border border-zinc-200 dark:border-white/5" />
            <div className="absolute inset-4 rounded-full border border-zinc-200 dark:border-white/5" />

            {/* Center Button -> Switch to Custom Mode */}
            <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 transform">
              <div className="relative flex flex-col items-center justify-center gap-1">
                <button
                  type="button"
                  onClick={() => setView('custom')}
                  className="relative h-16 w-16 overflow-hidden rounded-full border border-[#007AFF] bg-white shadow-md transition-all hover:scale-105 hover:shadow-lg flex items-center justify-center"
                  aria-label="Custom color"
                >
                  <div
                    className={cn(
                      'absolute inset-0 h-full w-full opacity-80',
                      !colorClass.startsWith('#') && colorClass,
                    )}
                    style={{
                      backgroundColor: colorClass.startsWith('#')
                        ? colorClass
                        : undefined,
                    }}
                  />
                  <div className="z-10 text-white">
                    <Pipette className="w-6 h-6" />
                  </div>
                </button>
              </div>
            </div>

            {/* Recommended colors (radial layout) */}
            {RECOMMENDED_COLOR_CLASSES.map((cls, index) => {
              const totalItems = RECOMMENDED_COLOR_CLASSES.length;
              const radius = 80;
              const angleInDegrees = (index * 360) / totalItems - 90;
              const angleInRadians = (angleInDegrees * Math.PI) / 180;
              const x = Math.cos(angleInRadians) * radius;
              const y = Math.sin(angleInRadians) * radius;
              const isSelected = colorClass === cls;
              const hexColor =
                cls.match(/bg-\[(#[A-Fa-f0-9]+)\]/)?.[1] || '#ffffff';
              const name = getColorName(cls);

              return (
                <div
                  key={cls}
                  className="absolute"
                  style={{
                    left: `calc(50% + ${x}px)`,
                    top: `calc(50% + ${y}px)`,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <div className="relative flex flex-col items-center gap-1">
                    <button
                      type="button"
                      className={cn(
                        'relative h-9 w-9 rounded-full border shadow-sm transition-all duration-300 hover:scale-110 flex items-center justify-center z-10',
                        'ring-1 ring-transparent ring-offset-2 ring-offset-white dark:ring-offset-zinc-900',
                        cls,
                        isSelected
                          ? 'scale-110 border-white shadow-md ring-zinc-400 dark:ring-zinc-500'
                          : 'border-transparent hover:shadow-md',
                      )}
                      onClick={() => onColorChange(cls)}
                      aria-label={strings.colorLabel}
                    >
                      <span className="text-[10px] font-bold text-white drop-shadow-md leading-none scale-90">
                        {name}
                      </span>
                    </button>
                  </div>

                  {/* Connecting line */}
                  <div
                    className={cn(
                      'absolute left-1/2 top-1/2 -z-10 h-[1px] origin-left transition-all duration-300',
                      isSelected
                        ? 'w-[55px] h-[2px]'
                        : 'w-[50px] bg-gradient-to-r from-zinc-200 to-transparent dark:from-zinc-700',
                    )}
                    style={{
                      transform: `rotate(${angleInDegrees + 180}deg)`,
                      left: '50%',
                      top: '50%',
                      ...(isSelected
                        ? {
                          background: `linear-gradient(to right, ${hexColor}, transparent)`,
                          boxShadow: `0 0 2px ${hexColor}`,
                        }
                        : {}),
                    }}
                  />
                </div>
              );
            })}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
