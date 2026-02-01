'use client';
import type { Locale as DateFnsLocale } from 'date-fns';
import { addDays, format, startOfDay } from 'date-fns';
import React, { useState } from 'react';
import type { DateRange } from 'react-day-picker';
import { Button } from '../../components/ui/button';
import { Calendar as DatePickerCalendar } from '../../components/ui/calendar';
import { DialogFooter } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Switch } from '../../components/ui/switch';
import { Textarea } from '../../components/ui/textarea';
import {
  RECOMMENDED_COLOR_CLASSES,
  RECOMMENDED_TIME_RANGES,
  TIME_OPTIONS,
} from '../../constants';
import type {
  CalendarCategory,
  CalendarStrings,
  EventEditorValues,
  UiLocale,
  WeekStart,
} from '../../types';
import { cn } from '../../utils';
import { ColorPickerPopover } from './color-picker-popover';

interface EventEditorProps {
  mode: 'create' | 'edit';
  initialTitle?: string;
  initialDescription?: string;
  initialStart: Date;
  initialEnd: Date;
  initialAllDay?: boolean;
  initialCategory?: string;
  initialCategories?: string[];
  initialColor?: string;
  categories?: CalendarCategory[];
  weekStart: WeekStart;
  locale: UiLocale;
  strings: CalendarStrings;
  dateFnsLocale: DateFnsLocale;
  defaultColorClass: string;
  onSubmit: (values: EventEditorValues) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

export function EventEditorForm(props: EventEditorProps) {
  const {
    mode,
    initialTitle,
    initialDescription,
    initialStart,
    initialEnd,
    initialAllDay,
    initialCategory,
    initialCategories,
    initialColor,
    categories,
    weekStart,
    locale,
    strings,
    dateFnsLocale,
    defaultColorClass,
    onSubmit,
    onCancel,
    onDelete,
  } = props;

  const [title, setTitle] = useState(initialTitle ?? '');
  const [description, setDescription] = useState(initialDescription ?? '');
  const [allDay, setAllDay] = useState(!!initialAllDay);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(() => {
    if (initialCategories && initialCategories.length > 0)
      return [...initialCategories];
    if (initialCategory) return [initialCategory];
    return [];
  });
  const [colorClass, setColorClass] = useState<string>(() => {
    if (initialColor) return initialColor;
    const palette = RECOMMENDED_COLOR_CLASSES;
    const randomFromPalette =
      palette[Math.floor(Math.random() * palette.length)] || defaultColorClass;
    return randomFromPalette || defaultColorClass;
  });
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    const from = startOfDay(initialStart);
    const to = startOfDay(initialEnd);
    return { from, to };
  });
  const [startTime, setStartTime] = useState<string>(
    format(initialStart, 'HH:mm'),
  );
  const [endTime, setEndTime] = useState<string>(format(initialEnd, 'HH:mm'));
  const [error, setError] = useState<string | null>(null);
  const [timePopoverOpen, setTimePopoverOpen] = useState(false);
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);

  const validationMessages =
    locale === 'zh'
      ? {
          titleRequired: '标题不能为空。',
          dateRangeRequired: '请选择日期范围。',
          startInvalid: '开始时间无效。',
          endInvalid: '结束时间无效。',
          endBeforeStart: '结束时间必须晚于开始时间。',
        }
      : {
          titleRequired: 'Title is required.',
          dateRangeRequired: 'Please select a date range.',
          startInvalid: 'Start time is invalid.',
          endInvalid: 'End time is invalid.',
          endBeforeStart: 'End time must be after start time.',
        };

  const isTimeRangeInvalid = React.useMemo(() => {
    if (allDay) return false;
    const from = dateRange?.from;
    const to = dateRange?.to ?? dateRange?.from;
    if (!from || !to) return false;

    const [startHourStr, startMinuteStr] = startTime.split(':');
    const [endHourStr, endMinuteStr] = endTime.split(':');

    const startHour = Number(startHourStr);
    const startMinute = Number(startMinuteStr);
    const endHour = Number(endHourStr);
    const endMinute = Number(endMinuteStr);

    if (
      Number.isNaN(startHour) ||
      Number.isNaN(startMinute) ||
      Number.isNaN(endHour) ||
      Number.isNaN(endMinute)
    ) {
      return false;
    }

    const startDateTime = new Date(
      from.getFullYear(),
      from.getMonth(),
      from.getDate(),
      startHour,
      startMinute,
    );
    const endDateTime = new Date(
      to.getFullYear(),
      to.getMonth(),
      to.getDate(),
      endHour,
      endMinute,
    );

    return endDateTime.getTime() <= startDateTime.getTime();
  }, [allDay, dateRange, startTime, endTime]);

  const formatRangeLabel = () => {
    if (!dateRange?.from && !dateRange?.to) {
      return strings.dateRangeLabel;
    }
    const from = dateRange.from;
    const to = dateRange.to ?? dateRange.from;
    if (!from || !to) return strings.dateRangeLabel;

    const sameDay =
      from.getFullYear() === to.getFullYear() &&
      from.getMonth() === to.getMonth() &&
      from.getDate() === to.getDate();

    if (sameDay) {
      return format(from, 'PP', { locale: dateFnsLocale });
    }
    const fromLabel = format(from, 'PP', { locale: dateFnsLocale });
    const toLabel = format(to, 'PP', { locale: dateFnsLocale });
    return `${fromLabel}  ${toLabel}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError(validationMessages.titleRequired);
      return;
    }

    const from = dateRange?.from;
    const to = dateRange?.to ?? dateRange?.from;
    if (!from || !to) {
      setError(validationMessages.dateRangeRequired);
      return;
    }

    const parseTime = (value: string) => {
      const [hourStr, minuteStr] = value.split(':');
      const hour = Number(hourStr);
      const minute = Number(minuteStr);
      if (
        Number.isNaN(hour) ||
        Number.isNaN(minute) ||
        hour < 0 ||
        hour > 23 ||
        minute < 0 ||
        minute > 59
      ) {
        return null;
      }
      return { hour, minute };
    };

    let start: Date;
    let end: Date;

    if (allDay) {
      const startDay = startOfDay(from);
      const endDay = startOfDay(to);
      start = startDay;
      end = addDays(endDay, 1);
    } else {
      const startParts = parseTime(startTime);
      const endParts = parseTime(endTime);
      if (!startParts) {
        setError(validationMessages.startInvalid);
        return;
      }
      if (!endParts) {
        setError(validationMessages.endInvalid);
        return;
      }

      start = new Date(
        from.getFullYear(),
        from.getMonth(),
        from.getDate(),
        startParts.hour,
        startParts.minute,
      );
      end = new Date(
        to.getFullYear(),
        to.getMonth(),
        to.getDate(),
        endParts.hour,
        endParts.minute,
      );
    }

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      setError(validationMessages.startInvalid);
      return;
    }

    if (end.getTime() <= start.getTime()) {
      setError(validationMessages.endBeforeStart);
      return;
    }

    const primaryCategory = selectedCategories[0];
    const normalizedCategories =
      selectedCategories.length > 0 ? selectedCategories : undefined;

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      start,
      end,
      allDay,
      category: primaryCategory,
      categories: normalizedCategories,
      colorClass: colorClass || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 text-sm">
      <div className="space-y-1">
        <Label htmlFor="title">{strings.titleLabel}</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={strings.titlePlaceholder}
          autoFocus
        />
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between gap-2">
          <Label>{strings.dateRangeLabel}</Label>
          <div className="flex items-center gap-2 rounded-md border border-zinc-200 px-2 py-1 text-[11px] dark:border-zinc-700">
            <span className="text-xs font-medium">{strings.allDayLabel}</span>
            <Switch
              id="all-day"
              checked={allDay}
              onCheckedChange={(checked) => setAllDay(checked)}
            />
          </div>
        </div>
        <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="w-full justify-start text-left font-normal"
            >
              <span className="truncate text-xs">{formatRangeLabel()}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="space-y-2 p-2 pb-3 rounded-xl"
            align="start"
            data-inline-editor-popup
          >
            <DatePickerCalendar
              mode="range"
              selected={dateRange}
              onSelect={(range) => {
                setDateRange(range);
                if (range?.from && range.to) {
                  setDatePopoverOpen(false);
                }
              }}
              numberOfMonths={1}
              locale={dateFnsLocale}
              weekStartsOn={weekStart === 'sunday' ? 0 : 1}
            />
            <div className="flex items-center justify-between pt-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-[11px]"
                onClick={() => {
                  const today = startOfDay(new Date());
                  setDateRange({ from: today, to: today });
                }}
              >
                {strings.todayLabel}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-[11px]"
                onClick={() => setDateRange(undefined)}
              >
                {locale === 'zh' ? '清除' : 'Clear'}
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-1">
        <Label>{strings.timeRangeLabel}</Label>
        <Popover open={timePopoverOpen} onOpenChange={setTimePopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className={cn(
                'w-full justify-between text-left text-xs font-normal',
                allDay && 'cursor-not-allowed opacity-60',
              )}
              disabled={allDay}
            >
              <span>
                {allDay ? strings.allDayLabel : `${startTime}  ${endTime}`}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-[320px] space-y-3 p-3"
            align="start"
            data-inline-editor-popup
          >
            <div className="grid gap-2 md:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="start-time-pop">{strings.startTimeLabel}</Label>
                <Select value={startTime} onValueChange={setStartTime}>
                  <SelectTrigger id="start-time-pop" className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent data-inline-editor-popup>
                    {TIME_OPTIONS.map((option) => (
                      <SelectItem key={option.index} value={option.label}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="end-time-pop">{strings.endTimeLabel}</Label>
                <Select value={endTime} onValueChange={setEndTime}>
                  <SelectTrigger id="end-time-pop" className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent data-inline-editor-popup>
                    {TIME_OPTIONS.map((option) => (
                      <SelectItem key={option.index} value={option.label}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                {strings.recommendedLabel}
              </div>
              <div className="flex flex-wrap gap-2">
                {RECOMMENDED_TIME_RANGES.map((preset) => {
                  const isActive =
                    startTime === preset.start && endTime === preset.end;
                  return (
                    <Button
                      key={`${preset.start}-${preset.end}`}
                      type="button"
                      variant={isActive ? 'secondary' : 'outline'}
                      size="sm"
                      className={cn(
                        'h-7 rounded-full px-2 text-[11px]',
                        !isActive &&
                          'bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800',
                      )}
                      onClick={() => {
                        setStartTime(preset.start);
                        setEndTime(preset.end);
                      }}
                    >
                      {preset.start}  {preset.end}
                    </Button>
                  );
                })}
              </div>
            </div>

            {isTimeRangeInvalid && (
              <p className="text-xs text-red-500">
                {validationMessages.endBeforeStart}
              </p>
            )}

            <div className="flex justify-end">
              <Button
                type="button"
                size="sm"
                onClick={() => setTimePopoverOpen(false)}
                disabled={isTimeRangeInvalid}
              >
                {locale === 'zh' ? '应用' : 'Apply'}
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="grid grid-cols-[1fr_auto] gap-0.5 items-start">
        {/* Categories as single-select urgency levels */}
        {!categories || categories.length === 0 ? null : (
          <div className="space-y-1">
            <Label>{strings.categoryLabel}</Label>
            <div className="flex flex-wrap gap-2">
              {categories?.map((cat) => {
                const isSelected = selectedCategories.includes(cat.id);
                return (
                  <div
                    key={cat.id}
                    className={cn(
                      'flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] cursor-pointer',
                      isSelected
                        ? 'border-zinc-900 bg-zinc-900 text-zinc-50 dark:border-zinc-50 dark:bg-zinc-50 dark:text-zinc-900'
                        : 'border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800',
                    )}
                    onClick={() => {
                      setSelectedCategories([cat.id]);
                      if (cat.colorClass) {
                        setColorClass(cat.colorClass);
                      }
                    }}
                  >
                    <span
                      className={cn('h-2 w-2 rounded-full', cat.colorClass)}
                    />
                    <span>{cat.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Color picker popover with recommended swatches */}
        <div className="space-y-1">
          <Label>{strings.colorLabel}</Label>
          <ColorPickerPopover
            colorClass={colorClass}
            onColorChange={(newColor) => {
              setColorClass(newColor);
              setSelectedCategories([]);
            }}
            strings={{ colorLabel: strings.colorLabel }}
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="description">{strings.descriptionLabel}</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={strings.descriptionPlaceholder}
          rows={3}
        />
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:space-x-2">
        <div className="flex gap-2">
          {onDelete && mode === 'edit' && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={onDelete}
            >
              {strings.deleteLabel}
            </Button>
          )}
        </div>
        <div className="flex gap-2 sm:justify-end">
          <Button type="button" variant="outline" size="sm" onClick={onCancel}>
            {strings.cancelLabel}
          </Button>
          <Button type="submit" size="sm">
            {mode === 'create' ? strings.createLabel : strings.saveLabel}
          </Button>
        </div>
      </DialogFooter>
    </form>
  );
}
