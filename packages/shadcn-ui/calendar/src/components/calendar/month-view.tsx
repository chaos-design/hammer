'use client';
import type { Locale as DateFnsLocale } from 'date-fns';
import {
  addDays,
  addMinutes,
  endOfDay,
  format,
  isSameMonth,
  isToday,
  isWeekend,
  startOfDay,
  startOfWeek,
} from 'date-fns';
import type React from 'react';
import { useState } from 'react';
import { SLOT_MINUTES } from '../../constants';
import type { ThemeConfig } from '../../theme';
import type {
  CalendarEvent,
  MonthPopoverState,
  UiLocale,
  WeekStart,
} from '../../types';
import { cn } from '../../utils';
import { buildMonthSpans, generateMonthDays } from '../../utils/calendar-logic';

interface MonthViewProps {
  className?: string;
  focusDate: Date;
  weekStart: WeekStart;
  events: CalendarEvent[];
  locale: UiLocale;
  theme: ThemeConfig;
  dateFnsLocale: DateFnsLocale;
  creatingRange: { start: Date; end: Date } | null;
  selectedEventId: string | null;
  accentBgClass: string;
  weekendTintClass: string;
  openInlineForSlot: (args: {
    start: Date;
    end: Date;
    anchorEl: HTMLElement;
    anchorOffset: { x: number; y: number };
  }) => void;
  handleMonthDayDrop: (e: React.DragEvent<HTMLDivElement>, day: Date) => void;
  setMonthPopover: (state: MonthPopoverState) => void;
  handleEventDragStart: (e: React.DragEvent, eventId: string) => void;
  handleEventClick: (e: React.MouseEvent, event: CalendarEvent) => void;
}

export function MonthView(props: MonthViewProps) {
  const {
    className,
    focusDate,
    weekStart,
    events,
    locale,
    theme,
    dateFnsLocale,
    creatingRange,
    selectedEventId,
    accentBgClass,
    weekendTintClass,
    openInlineForSlot,
    handleMonthDayDrop,
    setMonthPopover,
    handleEventDragStart,
    handleEventClick,
  } = props;

  const weekStartsOnNumber = weekStart === 'sunday' ? 0 : 1;
  const days = generateMonthDays(focusDate, weekStart);
  const weekdayStart = startOfWeek(new Date(), {
    weekStartsOn: weekStartsOnNumber,
  });
  const spansByRow = buildMonthSpans(days, events);
  const moreThreshold =
    theme.moreCountThreshold != null
      ? Math.min(10, Math.max(2, theme.moreCountThreshold))
      : 2;

  const [dragOverDay, setDragOverDay] = useState<Date | null>(null);

  return (
    <div className={cn('mt-3 space-y-1', className)}>
      <div className="grid grid-cols-7 gap-px text-xs font-medium uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">
        {Array.from({ length: 7 }).map((_, index) => {
          const label = format(addDays(weekdayStart, index), 'EEE', {
            locale: dateFnsLocale,
          });
          return (
            <div key={label} className="px-2 py-1 text-center">
              {label}
            </div>
          );
        })}
      </div>
      <div className="grid grid-rows-5 gap-px rounded-lg border border-zinc-200 bg-zinc-200 text-xs dark:border-zinc-800 dark:bg-zinc-800">
        {Array.from({ length: 5 }).map((_, rowIndex) => {
          const rowDays = days.slice(rowIndex * 7, rowIndex * 7 + 7);
          const rowSpans = (spansByRow[rowIndex] ?? []).filter(
            (span) => span.lane < moreThreshold,
          );

          return (
            <div
              key={`D${rowIndex + 1}`}
              className="relative grid grid-cols-7 gap-px"
            >
              {rowDays.map((day) => {
                const dayStart = startOfDay(day);
                const dayEnd = endOfDay(day);

                const isOtherMonth = !isSameMonth(day, focusDate);
                const isCurrent = isToday(day);

                const isInCreatingRange = creatingRange
                  ? creatingRange.start <= dayEnd &&
                    creatingRange.end >= dayStart
                  : false;

                const dayEvents = events.filter(
                  (event) => event.end > dayStart && event.start < dayEnd,
                );
                const extraCount = Math.max(
                  0,
                  dayEvents.length - moreThreshold,
                );

                const isDragOver =
                  dragOverDay &&
                  startOfDay(dragOverDay).getTime() === dayStart.getTime();

                return (
                  <div
                    key={day.toISOString()}
                    className={cn(
                      'relative flex h-28 flex-col items-stretch bg-white p-2 text-left align-top transition-colors dark:bg-zinc-900',
                      isOtherMonth &&
                        'bg-zinc-100 text-zinc-400 dark:bg-zinc-950 dark:text-zinc-600',
                      !isOtherMonth && isWeekend(day) && weekendTintClass,
                      !isOtherMonth &&
                        isCurrent &&
                        'bg-sky-50 dark:bg-sky-950/20',
                      isInCreatingRange &&
                        'ring-1 ring-sky-400 ring-offset-1 ring-offset-zinc-200 dark:ring-offset-zinc-900 z-10',
                      isDragOver && 'bg-sky-100 dark:bg-sky-900/30',
                    )}
                    style={
                      isOtherMonth
                        ? { opacity: theme.otherMonthOpacity }
                        : undefined
                    }
                    onKeyDown={() => {}}
                    onClick={(e) => {
                      const base = startOfDay(day);
                      const start = addMinutes(base, 9 * 60); // default 09:00
                      const end = addMinutes(start, SLOT_MINUTES);
                      const rect = e.currentTarget.getBoundingClientRect();
                      const anchorOffset = {
                        x: e.clientX - rect.left,
                        y: e.clientY - rect.top,
                      };
                      openInlineForSlot({
                        start,
                        end,
                        anchorEl: e.currentTarget as HTMLElement,
                        anchorOffset,
                      });
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      if (!isDragOver) {
                        setDragOverDay(day);
                      }
                    }}
                    onDragLeave={(e) => {
                      // Only clear if leaving the cell itself, not entering a child
                      if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                        setDragOverDay(null);
                      }
                    }}
                    onDrop={(e) => {
                      setDragOverDay(null);
                      handleMonthDayDrop(e, day);
                    }}
                  >
                    <div className="mb-1 flex items-center justify-between text-[11px]">
                      <span
                        className={cn(
                          'inline-flex h-6 w-6 items-center justify-center rounded-full',
                          isCurrent
                            ? 'bg-zinc-900 text-zinc-50 font-bold dark:bg-zinc-50 dark:text-zinc-900'
                            : 'text-zinc-600 dark:text-zinc-300',
                        )}
                      >
                        {format(day, 'd')}
                      </span>

                      {/* Show "+X more" text in header if there are hidden events */}
                      {extraCount > 0 &&
                        (theme.monthMorePopoverEnabled ? (
                          <button
                            type="button"
                            className="text-[10px] text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
                            onClick={(e) => {
                              e.stopPropagation();
                              const rect = (
                                e.currentTarget as HTMLElement
                              ).getBoundingClientRect();
                              setMonthPopover({
                                day,
                                anchorRect: rect,
                              });
                            }}
                          >
                            {locale === 'zh'
                              ? `还有 ${extraCount} 条日志`
                              : `${extraCount} more`}
                          </button>
                        ) : (
                          <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                            {locale === 'zh'
                              ? `还有 ${extraCount} 条日志`
                              : `${extraCount} more`}
                          </span>
                        ))}
                    </div>
                  </div>
                );
              })}

              {/* Events Layer */}
              <div className="absolute inset-0 grid grid-cols-7 grid-rows-1 gap-px pointer-events-none">
                {rowSpans.map((span) => {
                  const colSpan = span.colEnd - span.colStart + 1;
                  return (
                    <div
                      key={`${span.event.id}-${rowIndex}-${span.colStart}`}
                      className={cn(
                        'pointer-events-auto flex h-6 items-center gap-1 px-1.5 mx-1.5 text-[11px] leading-tight text-white cursor-grab rounded-md active:cursor-grabbing',
                        span.event.color &&
                          !span.event.color.startsWith('#') &&
                          span.event.color,
                        !span.event.color && accentBgClass,
                        selectedEventId === span.event.id &&
                          'ring-1 ring-white/80 ring-offset-1 ring-offset-sky-500',
                      )}
                      style={{
                        gridColumnStart: span.colStart + 1,
                        gridColumnEnd: `span ${colSpan}`,
                        gridRow: 1,
                        marginTop: `${36 + span.lane * 26}px`,
                        zIndex: 2,
                        ...(span.event.color && span.event.color.startsWith('#')
                          ? { backgroundColor: span.event.color }
                          : {}),
                      }}
                      draggable
                      onDragStart={(e) =>
                        handleEventDragStart(e, span.event.id)
                      }
                      onClick={(e) => handleEventClick(e, span.event)}
                    >
                      <span className="truncate">{span.event.title}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
