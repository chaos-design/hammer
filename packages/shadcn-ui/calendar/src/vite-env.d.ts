/// <reference types="vite/client" />

declare module '@chaos-design/color-picker' {
  interface ColorPickerProps {
    color: string;
    onChange: (color: string) => void;
    onBack?: () => void;
    className?: string;
  }

  export function ColorPicker(
    props: ColorPickerProps,
  ): import('react').ReactNode;
}

declare module '@chaos-design/month-datepicker' {
  interface MonthDatepickerProps {
    currentDate: Date;
    onMonthSelect: (date: Date) => void;
    locale: import('date-fns').Locale;
  }

  export function MonthDatepicker(
    props: MonthDatepickerProps,
  ): import('react').ReactNode;
}
