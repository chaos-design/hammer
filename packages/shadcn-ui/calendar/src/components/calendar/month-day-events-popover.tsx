'use client';
import type { Locale as DateFnsLocale } from 'date-fns';
import { endOfDay, format, startOfDay } from 'date-fns';
import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../../components/ui/button';
import type { CalendarEvent, MonthPopoverState, UiLocale } from '../../types';
import { cn } from '../../utils';

interface MonthDayEventsPopoverProps {
  state: MonthPopoverState | null;
  events: CalendarEvent[];
  accentBgClass: string;
  onClose: () => void;
  locale: UiLocale;
  dateFnsLocale: DateFnsLocale;
  onView: (event: CalendarEvent) => void;
  onEdit: (event: CalendarEvent) => void;
  onDelete: (event: CalendarEvent) => void;
}

export function MonthDayEventsPopover(props: MonthDayEventsPopoverProps) {
  const {
    state,
    events,
    accentBgClass,
    onClose,
    locale,
    dateFnsLocale,
    onView,
    onEdit,
    onDelete,
  } = props;
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!state) return;
    if (typeof window === 'undefined') return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current) return;
      const target = event.target as Node | null;
      if (target && containerRef.current.contains(target)) {
        return;
      }
      onClose();
    };

    window.addEventListener('pointerdown', handlePointerDown, true);
    return () => {
      window.removeEventListener('pointerdown', handlePointerDown, true);
    };
  }, [state, onClose]);

  if (!state) return null;

  const { day, anchorRect } = state;

  const dayStart = startOfDay(day);
  const dayEnd = endOfDay(day);
  const dayEvents = events
    .filter((event) => event.end > dayStart && event.start < dayEnd)
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  const width = 280;
  const estimatedHeight = 320; // max-h-64 (256) + header + padding

  let left = anchorRect.left;
  let top: number | undefined;
  let bottom: number | undefined;

  if (typeof window !== 'undefined') {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Horizontal positioning
    if (left + width + 8 > viewportWidth) {
      left = Math.max(8, viewportWidth - width - 8);
    }

    // Vertical positioning
    const spaceBelow = viewportHeight - anchorRect.bottom;
    const spaceAbove = anchorRect.top;

    // Prefer down, unless not enough space below AND more space above
    if (spaceBelow < estimatedHeight && spaceAbove > spaceBelow) {
      // Flip up
      bottom = viewportHeight - anchorRect.top + 8;
    } else {
      // Default down
      top = anchorRect.bottom + 8;
    }
  }

  const titleLabel =
    locale === 'zh'
      ? format(day, 'yyyy-MM-dd', { locale: dateFnsLocale })
      : format(day, 'eeee, MMM d, yyyy', { locale: dateFnsLocale });

  const shell = (
    <div className="fixed inset-0 z-30 pointer-events-none">
      <div
        ref={containerRef}
        className="pointer-events-auto absolute w-[280px] max-w-[90vw] rounded-xl border border-zinc-200 bg-white p-3 text-xs shadow-lg dark:border-zinc-700 dark:bg-zinc-900"
        style={{
          left,
          top: top !== undefined ? top : undefined,
          bottom: bottom !== undefined ? bottom : undefined,
        }}
      >
        <div className="mb-2 flex items-center justify-between gap-2">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">
              {locale === 'zh' ? '当天日程' : 'Day events'}
            </p>
            <p className="text-[11px] text-zinc-700 dark:text-zinc-300">
              {titleLabel}
            </p>
          </div>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-6 w-6"
            onClick={onClose}
          >
            ×
          </Button>
        </div>

        <div className="max-h-64 space-y-1 overflow-y-auto">
          {dayEvents.length === 0 ? (
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              {locale === 'zh' ? '暂无日程。' : 'No events for this day.'}
            </p>
          ) : (
            dayEvents.map((event) => {
              const isAllDay = !!event.allDay;
              const timeLabel = isAllDay
                ? locale === 'zh'
                  ? '全天'
                  : 'All-day'
                : `${format(event.start, 'HH:mm')} – ${format(event.end, 'HH:mm')}`;

              return (
                <div
                  key={event.id}
                  className="flex items-start gap-2 rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 text-[11px] leading-snug dark:border-zinc-700 dark:bg-zinc-900"
                >
                  <span
                    className={cn(
                      'mt-0.5 h-2 w-2 flex-shrink-0 rounded-full',
                      event.color &&
                        !event.color.startsWith('#') &&
                        event.color,
                      !event.color && accentBgClass,
                    )}
                    style={
                      event.color && event.color.startsWith('#')
                        ? { backgroundColor: event.color }
                        : undefined
                    }
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="truncate font-medium">{event.title}</div>
                      <div className="text-[10px] text-zinc-500 dark:text-zinc-400">
                        {timeLabel}
                      </div>
                    </div>
                    {event.description && (
                      <div className="mt-0.5 line-clamp-2 text-[10px] text-zinc-500 dark:text-zinc-400">
                        {event.description}
                      </div>
                    )}
                    <div className="mt-1 flex flex-wrap gap-1">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-6 px-2 text-[10px]"
                        onClick={() => onView(event)}
                      >
                        {locale === 'zh' ? '查看' : 'View'}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-6 px-2 text-[10px]"
                        onClick={() => onEdit(event)}
                      >
                        {locale === 'zh' ? '编辑' : 'Edit'}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-6 px-2 text-[10px] text-red-500 hover:text-red-600"
                        onClick={() => onDelete(event)}
                      >
                        {locale === 'zh' ? '删除' : 'Delete'}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );

  if (typeof document === 'undefined') return shell;

  return createPortal(shell, document.body);
}
