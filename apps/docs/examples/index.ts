import type React from 'react';

export const registry: Record<
  string,
  () => Promise<{ default: React.ComponentType<any> }>
> = {
  calendar: () =>
    import('./calendar').then((mod) => ({ default: mod.Calendar })),
  'month-datepicker': () =>
    import('./month-datepicker').then((mod) => ({
      default: mod.MonthDatepickerDemo,
    })),
  'theme-switch': () =>
    import('./theme-switch').then((mod) => ({ default: mod.ThemeSwitchDemo })),
  'color-picker': () =>
    import('./color-picker').then((mod) => ({ default: mod.ColorPickerDemo })),
};
