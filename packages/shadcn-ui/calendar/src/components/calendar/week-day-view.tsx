"use client";
import type { Locale as DateFnsLocale } from 'date-fns';
import {
  addDays,
  addMinutes,
  differenceInMinutes,
  endOfDay,
  format,
  isToday,
  isWeekend,
  startOfDay,
  startOfWeek,
} from 'date-fns';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type React from 'react';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { cn } from '../../utils';
import type { ThemeConfig } from '../../theme';
import { SLOT_HEIGHT, SLOT_MINUTES, SLOTS_PER_DAY } from '../../constants';
import {
  buildDaySegments,
} from '../../utils/calendar-logic';
import type {
  CalendarCategory,
  CalendarEvent,
  CalendarStrings,
  DragKind,
  UiLocale,
  WeekStart,
} from '../../types';

interface WeekDayViewProps {
  view: 'week' | 'day';
  focusDate: Date;
  weekStart: WeekStart;
  events: CalendarEvent[];
  categories?: CalendarCategory[];
  theme: ThemeConfig;
  locale: UiLocale;
  strings: CalendarStrings;
  dateFnsLocale: DateFnsLocale;
  creatingRange: { start: Date; end: Date } | null;
  selectedEventId: string | null;
  accentBgClass: string;
  weekendTintClass: string;
  gridLineClass: string;
  weekSummaryExpanded: boolean;
  setWeekSummaryExpanded: React.Dispatch<React.SetStateAction<boolean>>;
  openInlineForSlot: (args: {
    start: Date;
    end: Date;
    anchorEl: HTMLElement;
    anchorOffset: { x: number; y: number };
  }) => void;
  handleDayColumnDrop: (e: React.DragEvent<HTMLDivElement>, day: Date) => void;
  handleDayColumnDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  handleEventDragStart: (e: React.DragEvent, eventId: string) => void;
  handleEventClick: (e: React.MouseEvent, event: CalendarEvent) => void;
  handleResizeDragStart: (
    e: React.DragEvent,
    eventId: string,
    kind: DragKind,
  ) => void;
  timeSlots: { label: string; index: number }[];
}

export function WeekDayView(props: WeekDayViewProps) {
  const {
    view,
    focusDate,
    weekStart,
    events,
    theme,
    locale,
    strings,
    dateFnsLocale,
    creatingRange,
    selectedEventId,
    accentBgClass,
    weekendTintClass,
    gridLineClass,
    weekSummaryExpanded,
    setWeekSummaryExpanded,
    openInlineForSlot,
    handleDayColumnDrop,
    handleDayColumnDragOver,
    handleEventDragStart,
    handleEventClick,
    timeSlots,
  } = props;

  const weekStartsOnNumber = weekStart === 'sunday' ? 0 : 1;
  const weekDays = (() => {
    const start = startOfWeek(focusDate, { weekStartsOn: weekStartsOnNumber });
    return Array.from({ length: 7 }).map((_, index) => addDays(start, index));
  })();

  const days = view === 'week' ? weekDays : [focusDate];
  const useSingleColumn = view === 'day' && theme.dayViewFullWidth;
  const dayGridColsClass = useSingleColumn ? 'grid-cols-1' : 'grid-cols-7';
  const showWeekSummary = view === 'week' && theme.weekSummaryEnabled;

  const allDayEventsToday = (date: Date) => {
    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);
    return events.filter((event) => {
      if (event.allDay) {
        return event.end > dayStart && event.start < dayEnd;
      }
      return false;
    });
  };

  return (
    <div className="mt-3 flex flex-col rounded-lg border border-zinc-200 bg-white text-xs shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="grid grid-cols-[60px_1fr] border-b border-zinc-200 bg-zinc-50 text-[11px] uppercase tracking-[0.16em] text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400">
        <div className="px-2 py-2">{strings.allDayRowLabel}</div>
        <div className={cn('grid', dayGridColsClass)}>
          {days.map((day) => (
            <div
              key={day.toISOString()}
              className={cn(
                'border-l border-zinc-200 px-2 py-2 dark:border-zinc-800',
                isToday(day) && 'bg-sky-50/60 dark:bg-sky-900/20',
              )}
            >
              <div className="mb-1 flex items-center justify-between gap-2">
                <div className="flex items-baseline gap-1">
                  {locale === 'zh' ? (
                    <>
                      <span className="text-[11px] font-medium">
                        {format(day, 'MM-dd', { locale: dateFnsLocale })}
                      </span>
                      <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        {format(day, 'EEE', { locale: dateFnsLocale })}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-[11px] font-medium">
                        {format(day, 'EEE', { locale: dateFnsLocale })}
                      </span>
                      <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        {format(day, 'MMM d', { locale: dateFnsLocale })}
                      </span>
                    </>
                  )}
                </div>
                {isToday(day) && (
                  <Badge
                    variant="outline"
                    className="border-sky-400 px-0.5 text-[10px] text-sky-600 dark:border-sky-500 dark:text-sky-400"
                  >
                    {strings.todayBadgeLabel}
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap gap-1">
                {allDayEventsToday(day).map((event) => (
                  <button
                    key={event.id}
                    type="button"
                    className={cn(
                      'inline-flex h-6 items-center gap-1 rounded-full px-2 text-[11px] leading-tight text-white',
                      event.color &&
                      !event.color.startsWith('#') &&
                      event.color,
                      !event.color && accentBgClass,
                      selectedEventId === event.id &&
                      'ring-1 ring-white/80 ring-offset-1 ring-offset-sky-500',
                    )}
                    style={
                      event.color && event.color.startsWith('#')
                        ? { backgroundColor: event.color }
                        : undefined
                    }
                    onClick={(e) => handleEventClick(e, event)}
                  >
                    <span className="truncate">{event.title}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {showWeekSummary && (
        <div className="grid grid-cols-[60px_1fr] border-b border-zinc-200 bg-zinc-50 text-[11px] text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-300">
          <div className="flex items-center justify-center px-2 py-1">
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-6 w-6"
              onClick={() => setWeekSummaryExpanded((prev) => !prev)}
              aria-label={
                weekSummaryExpanded
                  ? locale === 'zh'
                    ? '收起汇总'
                    : 'Collapse summary'
                  : locale === 'zh'
                    ? '展开汇总'
                    : 'Expand summary'
              }
            >
              {weekSummaryExpanded ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
            </Button>
          </div>
          <div
            className={cn(
              'grid gap-1 pr-1 place-items-start',
              dayGridColsClass,
            )}
          >
            {days.map((day) => {
              const dayStart = startOfDay(day);
              const dayEnd = endOfDay(day);
              const dayEvents = events
                .filter((event) => event.end > dayStart && event.start < dayEnd)
                .sort((a, b) => a.start.getTime() - b.start.getTime());

              const visibleEvents = weekSummaryExpanded
                ? dayEvents
                : dayEvents.slice(0, 2);
              const extraCount = Math.max(
                0,
                dayEvents.length - visibleEvents.length,
              );

              return (
                <div
                  key={day.toISOString()}
                  className="flex flex-col h-full w-full flex-wrap gap-1 border-l border-zinc-200 bg-white/40 px-2 py-1 dark:border-zinc-800 dark:bg-zinc-900/40"
                >
                  {visibleEvents.map((event) => (
                    <div
                      key={event.id}
                      className={cn(
                        'flex w-full min-w-0 h-6 items-center gap-1 rounded-full px-2 text-[11px] leading-tight text-white',
                        event.color &&
                        !event.color.startsWith('#') &&
                        event.color,
                        !event.color && accentBgClass,
                        selectedEventId === event.id &&
                        'ring-1 ring-white/80 ring-offset-1 ring-offset-sky-500',
                      )}
                      style={
                        event.color && event.color.startsWith('#')
                          ? { backgroundColor: event.color }
                          : undefined
                      }
                      onClick={(e) => handleEventClick(e, event)}
                    >
                      <span className="truncate">{event.title}</span>
                    </div>
                  ))}
                  {extraCount > 0 && !weekSummaryExpanded && (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-6 px-2 text-[11px] text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                      onClick={() => setWeekSummaryExpanded(true)}
                    >
                      +{extraCount} {locale === 'zh' ? '更多' : 'more'}
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Time grid */}
      <div className="grid grid-cols-[60px_1fr]">
        {/* Time gutter */}
        <div className="flex flex-col border-zinc-200 text-[11px] text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
          {timeSlots.map((slot) => (
            <div
              key={slot.index}
              className="flex h-[28px] items-start justify-end pr-2"
            >
              {slot.label.endsWith(':00') && <span>{slot.label}</span>}
            </div>
          ))}
        </div>

        {/* Day columns */}
        <div className={cn('relative grid', dayGridColsClass)}>
          {days.map((day) => {
            const daySegments = buildDaySegments(day, events);
            const dayStart = startOfDay(day);
            const dayEnd = endOfDay(day);

            const selectionOverlay = (() => {
              if (!creatingRange) return null;
              const rangeStart =
                creatingRange.start.getTime() < dayStart.getTime()
                  ? dayStart
                  : creatingRange.start;
              const rangeEnd =
                creatingRange.end.getTime() > dayEnd.getTime()
                  ? dayEnd
                  : creatingRange.end;

              if (rangeEnd.getTime() <= rangeStart.getTime()) return null;

              const startMinutes = Math.max(
                0,
                differenceInMinutes(rangeStart, dayStart),
              );
              const endMinutes = Math.min(
                24 * 60,
                differenceInMinutes(rangeEnd, dayStart),
              );
              const top = (startMinutes / SLOT_MINUTES) * SLOT_HEIGHT;
              const height =
                ((endMinutes - startMinutes) / SLOT_MINUTES) * SLOT_HEIGHT;

              return (
                <div
                  className="pointer-events-none absolute inset-x-1 rounded-md bg-sky-500/10 ring-1 ring-dashed ring-sky-400"
                  style={{ top, height }}
                />
              );
            })();

            return (
              <div
                key={day.toISOString()}
                className={cn(
                  'relative border-l border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900',
                  isWeekend(day) && weekendTintClass,
                )}
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const offsetY = e.clientY - rect.top;
                  const offsetX = e.clientX - rect.left;
                  const slotIndex = Math.min(
                    Math.max(Math.floor(offsetY / SLOT_HEIGHT), 0),
                    SLOTS_PER_DAY - 1,
                  );
                  const minutesFromStart = slotIndex * SLOT_MINUTES;
                  const start = addMinutes(dayStart, minutesFromStart);
                  const end = addMinutes(start, SLOT_MINUTES);
                  openInlineForSlot({
                    start,
                    end,
                    anchorEl: e.currentTarget as HTMLElement,
                    anchorOffset: { x: offsetX, y: offsetY },
                  });
                }}
                onKeyDown={() => { }}
                onDragOver={handleDayColumnDragOver}
                onDrop={(e) => handleDayColumnDrop(e, day)}
              >
                {/* 30-minute grid lines */}
                {timeSlots.map((slot) => (
                  <div
                    key={slot.index}
                    className={cn(
                      'pointer-events-none h-[28px]',
                      gridLineClass,
                      isToday(day) && 'bg-sky-50/60 dark:bg-sky-900/10',
                    )}
                  />
                ))}

                {selectionOverlay}

                {/* Events */}
                {daySegments.map((segment) => {
                  const { event, top, height, lane, laneCount } = segment;
                  const widthPercent = 100 / laneCount;
                  const leftPercent = widthPercent * lane;
                  const laneOpacity =
                    view === 'week' && theme.weekOverlapAlternateOpacity
                      ? lane === 0
                        ? 1
                        : lane === 1
                          ? 0.85
                          : lane === 2
                            ? 0.7
                            : 0.55
                      : 1;

                  return (
                    <div
                      key={`${event.id}-${segment.start.toISOString()}`}
                      className={cn(
                        'absolute z-20 flex cursor-move flex-col overflow-hidden border border-zinc-200 px-1 py-0.5 text-[11px] leading-tight text-white shadow-sm dark:border-zinc-700 rounded-md text-left dark:text-zinc-50',
                        event.color &&
                        !event.color.startsWith('#') &&
                        event.color,
                        !event.color && accentBgClass,
                        selectedEventId === event.id &&
                        'ring-2 ring-white/80 ring-offset-2 ring-offset-sky-600',
                      )}
                      style={{
                        top,
                        height,
                        left: `calc(${leftPercent}% + 2px)`,
                        width: `calc(${widthPercent}% - 4px)`,
                        opacity: laneOpacity,
                        ...(event.color && event.color.startsWith('#')
                          ? { backgroundColor: event.color }
                          : {}),
                      }}
                      draggable
                      onDragStart={(e) => handleEventDragStart(e, event.id)}
                      onClick={(e) => handleEventClick(e, event)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={() => { }}
                    >
                      {/* Week/day view: dragging this card moves the event in 30-minute slots via the time grid; in month view, chips are draggable between days to change only the date. */}
                      <div className="flex items-center justify-between gap-1 w-full">
                        <span className="truncate font-medium">
                          {event.title}
                        </span>
                        {/* {getEventCategoryIds(event).length > 0 && (
                          <span className="ml-1 inline-flex items-center gap-0.5 rounded-full bg-black/10 px-1 text-[9px] font-medium uppercase tracking-wide">
                            {getEventCategoryLabels(event, categories)
                              .slice(0, 2)
                              .map((label, index) => (
                                <span key={label}>
                                  {index > 0 ? ',' : ''}
                                  {label}
                                </span>
                              ))}
                          </span>
                        )} */}
                      </div>
                      {/* <div className="flex items-center justify-between text-[10px] opacity-90">
                        <span>
                          {format(segment.start, 'HH:mm')} –{' '}
                          {format(segment.end, 'HH:mm')}
                        </span>
                        <button
                          type="button"
                          className="ml-1 cursor-row-resize rounded-sm bg-black/15 px-1 text-[9px] uppercase tracking-wide"
                          draggable
                          onDragStart={(e) =>
                            handleResizeDragStart(e, event.id, 'resize-end')
                          }
                          onClick={(e) => e.stopPropagation()}
                        >
                          Resize
                        </button>
                      </div> */}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
