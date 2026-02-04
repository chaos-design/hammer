'use client';
import type { Locale as DateFnsLocale } from 'date-fns';
import { addMinutes, differenceInMinutes, format, startOfDay } from 'date-fns';
import { enUS, zhCN } from 'date-fns/locale';
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';
import { EventEditorForm } from './components/calendar/event-editor-form';
import { CalendarHeader } from './components/calendar/header';
import { InlineEventEditor } from './components/calendar/inline-event-editor';
import { MonthDayEventsPopover } from './components/calendar/month-day-events-popover';
import { MonthView } from './components/calendar/month-view';
import { WeekDayView } from './components/calendar/week-day-view';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './components/ui/dialog';
import {
  ACCENT_BG_CLASSES,
  ACCENT_RING_CLASSES,
  DEFAULT_CATEGORIES,
  SLOT_HEIGHT,
  SLOT_MINUTES,
  SLOTS_PER_DAY,
  STRINGS,
  TIME_OPTIONS,
} from './constants';
import { DEFAULT_THEME, type ThemeConfig } from './theme';
import type {
  AccentColor,
  CalendarEvent,
  CalendarSchedulerProps,
  CalendarSchedulerRef,
  CalendarView,
  DragKind,
  DragPayload,
  EventEditorValues,
  InlineEditorState,
  MonthPopoverState,
  WeekStart,
} from './types';
import { cn } from './utils';

const CalendarScheduler = forwardRef<
  CalendarSchedulerRef,
  CalendarSchedulerProps
>((props, ref) => {
  const {
    className,
    events: propsEvents,
    defaultEvents,
    defaultView = 'month',
    weekStart = 'monday',
    initialDate = new Date(),
    onEventCreate,
    onEventUpdate,
    onEventDelete,
    theme = 'light',
    onThemeToggle,
    categories = DEFAULT_CATEGORIES,
    locale = 'en',
    themeConfig,
    classNames,
  } = props;

  void theme;
  void onThemeToggle;

  const [internalEvents, setInternalEvents] = useState<CalendarEvent[]>(
    defaultEvents || [],
  );
  const isControlled = propsEvents !== undefined;
  const events = isControlled ? propsEvents! : internalEvents;

  const triggerEventCreate = (event: CalendarEvent) => {
    if (!isControlled) {
      setInternalEvents((prev) => [...prev, event]);
    }
    onEventCreate?.(event);
  };

  const triggerEventUpdate = (event: CalendarEvent) => {
    if (!isControlled) {
      setInternalEvents((prev) =>
        prev.map((e) => (e.id === event.id ? event : e)),
      );
    }
    onEventUpdate?.(event);
  };

  const triggerEventDelete = React.useCallback(
    (id: string) => {
      if (!isControlled) {
        setInternalEvents((prev) => prev.filter((e) => e.id !== id));
      }
      onEventDelete?.(id);
    },
    [isControlled, onEventDelete],
  );

  useImperativeHandle(ref, () => ({
    getEvents: () => events,
    setEvents: (newEvents: CalendarEvent[]) => {
      if (isControlled) {
        console.warn(
          'CalendarScheduler: setEvents called on controlled component. This will have no effect on rendering unless you update the events prop.',
        );
      }
      setInternalEvents(newEvents);
    },
    addEvent: (event: CalendarEvent) => triggerEventCreate(event),
    updateEvent: (event: CalendarEvent) => triggerEventUpdate(event),
    deleteEvent: (id: string) => triggerEventDelete(id),
  }));

  const [currentView, setCurrentView] = useState<CalendarView>(defaultView);
  const [focusDate, setFocusDate] = useState<Date>(initialDate);
  const [weekStartState, setWeekStartState] = useState<WeekStart>(weekStart);
  const [accent] = useState<AccentColor>('sky');

  // Sync state with props if they change
  useEffect(() => {
    setCurrentView(defaultView);
  }, [defaultView]);

  useEffect(() => {
    setWeekStartState(weekStart);
  }, [weekStart]);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [modalEvent, setModalEvent] = useState<CalendarEvent | undefined>(
    undefined,
  );

  const [inlineEditor, setInlineEditor] = useState<InlineEditorState | null>(
    null,
  );
  const [creatingRange, setCreatingRange] = useState<{
    start: Date;
    end: Date;
  } | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [weekSummaryExpanded, setWeekSummaryExpanded] = useState(false);
  const [monthPopover, setMonthPopover] = useState<MonthPopoverState | null>(
    null,
  );
  const [monthPopoverOpen, setMonthPopoverOpen] = useState(false);

  const strings = STRINGS[locale];
  const dateFnsLocale: DateFnsLocale = locale === 'zh' ? zhCN : enUS;
  const effectiveTheme: ThemeConfig = themeConfig ?? DEFAULT_THEME;

  const accentKey: AccentColor = accent;
  const accentBgClass = ACCENT_BG_CLASSES[accentKey];
  const accentRingClass = ACCENT_RING_CLASSES[accentKey];

  const weekendTintClass =
    effectiveTheme.weekendTint === 'mild'
      ? 'bg-zinc-50/80 dark:bg-zinc-900/60'
      : effectiveTheme.weekendTint === 'strong'
        ? 'bg-zinc-200 dark:bg-zinc-900'
        : 'bg-zinc-100 dark:bg-zinc-900/70';

  const gridLineClass =
    effectiveTheme.gridLines === 'solid'
      ? 'border-b border-zinc-200 dark:border-zinc-800'
      : 'border-b border-dashed border-zinc-200 dark:border-zinc-800';

  // ----- Keyboard shortcuts -----

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tagName = (e.target as HTMLElement | null)?.tagName;
      const isTypingTarget = tagName === 'INPUT' || tagName === 'TEXTAREA';

      if (e.key === 'Escape') {
        if (modalOpen || inlineEditor?.open) {
          e.preventDefault();
          setModalOpen(false);
          setInlineEditor(null);
          setCreatingRange(null);
        }
      }

      if (!isTypingTarget && (e.key === 'Delete' || e.key === 'Backspace')) {
        if (selectedEventId && onEventDelete) {
          e.preventDefault();
          triggerEventDelete(selectedEventId);
          setSelectedEventId(null);
        }
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [
    modalOpen,
    inlineEditor,
    selectedEventId,
    onEventDelete,
    triggerEventDelete,
  ]);

  const monthLabel =
    locale === 'zh'
      ? format(focusDate, 'yyyy-MM', { locale: dateFnsLocale })
      : format(focusDate, 'MMMM yyyy', { locale: dateFnsLocale });

  const handleNewEventClick = () => {
    setModalMode('create');
    setModalEvent(undefined);
    setModalOpen(true);
  };

  const handleModalSubmit = (values: EventEditorValues) => {
    const startTime = values.start.getTime();
    const endTime = values.end.getTime();
    if (
      Number.isNaN(startTime) ||
      Number.isNaN(endTime) ||
      endTime <= startTime
    ) {
      console.warn('Ignored event creation with invalid date range', values);
      return;
    }

    const categoriesIds =
      values.categories && values.categories.length > 0
        ? values.categories
        : undefined;
    const primaryCategory = categoriesIds?.[0] ?? values.category;

    const id = `evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const event: CalendarEvent = {
      id,
      title: values.title,
      description: values.description || undefined,
      start: values.start,
      end: values.end,
      allDay: values.allDay,
      category: primaryCategory,
      categories: categoriesIds,
      color: values.colorClass,
    };
    if (modalMode === 'edit' && modalEvent) {
      triggerEventUpdate({ ...modalEvent, ...event, id: modalEvent.id });
    } else {
      triggerEventCreate(event);
    }
    setModalOpen(false);
  };

  const handleInlineSubmit = (
    values: EventEditorValues,
    existing?: CalendarEvent,
  ) => {
    const startTime = values.start.getTime();
    const endTime = values.end.getTime();
    if (
      Number.isNaN(startTime) ||
      Number.isNaN(endTime) ||
      endTime <= startTime
    ) {
      console.warn(
        'Ignored inline event submission with invalid date range',
        values,
      );
      return;
    }

    if (existing) {
      const categoriesIds =
        values.categories && values.categories.length > 0
          ? values.categories
          : existing.categories;
      const primaryCategory =
        (categoriesIds && categoriesIds[0]) ??
        values.category ??
        existing.category;

      const updated: CalendarEvent = {
        ...existing,
        title: values.title,
        description: values.description || undefined,
        start: values.start,
        end: values.end,
        allDay: values.allDay,
        category: primaryCategory,
        categories: categoriesIds,
        color: values.colorClass ?? existing.color,
      };
      triggerEventUpdate(updated);
    } else {
      const categoriesIds =
        values.categories && values.categories.length > 0
          ? values.categories
          : undefined;
      const primaryCategory = categoriesIds?.[0] ?? values.category;

      const id = `evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const event: CalendarEvent = {
        id,
        title: values.title,
        description: values.description || undefined,
        start: values.start,
        end: values.end,
        allDay: values.allDay,
        category: primaryCategory,
        categories: categoriesIds,
        color: values.colorClass,
      };
      triggerEventCreate(event);
    }
    setCreatingRange(null);
  };

  const handleInlineClose = () => {
    setInlineEditor(null);
    setCreatingRange(null);
  };

  const handleInlineDelete = (id: string) => {
    triggerEventDelete(id);
  };

  const openInlineForSlot = (args: {
    start: Date;
    end: Date;
    anchorEl: HTMLElement;
    anchorOffset: { x: number; y: number };
  }) => {
    const { start, end, anchorEl, anchorOffset } = args;
    setInlineEditor({
      open: true,
      mode: 'create',
      anchorEl,
      anchorOffset,
      start,
      end,
    });
    setCreatingRange({ start, end });
  };

  const openInlineForEvent = (
    event: CalendarEvent,
    anchorEl: HTMLElement,
    anchorOffset: { x: number; y: number },
  ) => {
    setInlineEditor({
      open: true,
      mode: 'edit',
      anchorEl,
      anchorOffset,
      start: event.start,
      end: event.end,
      event,
    });
    setCreatingRange({ start: event.start, end: event.end });
  };

  const handleEventClick = (e: React.MouseEvent, event: CalendarEvent) => {
    e.stopPropagation();
    setSelectedEventId(event.id);
    const el = e.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    const anchorOffset = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    openInlineForEvent(event, el, anchorOffset);
  };

  const handleEventDragStart = (e: React.DragEvent, eventId: string) => {
    const payload: DragPayload = { type: 'move', eventId };
    e.dataTransfer.setData(
      'application/x-calendar-event',
      JSON.stringify(payload),
    );
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleResizeDragStart = (
    e: React.DragEvent,
    eventId: string,
    kind: DragKind,
  ) => {
    e.stopPropagation();
    const payload: DragPayload = { type: kind, eventId };
    e.dataTransfer.setData(
      'application/x-calendar-event',
      JSON.stringify(payload),
    );
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDayColumnDrop = (
    e: React.DragEvent<HTMLDivElement>,
    day: Date,
  ) => {
    e.preventDefault();
    const raw = e.dataTransfer.getData('application/x-calendar-event');
    if (!raw) return;

    let payload: DragPayload;
    try {
      payload = JSON.parse(raw) as DragPayload;
    } catch {
      return;
    }

    const event = events.find((evt) => evt.id === payload.eventId);
    if (!event) return;

    const columnRect = e.currentTarget.getBoundingClientRect();
    const offsetY = e.clientY - columnRect.top;
    const slotIndex = Math.min(
      Math.max(Math.floor(offsetY / SLOT_HEIGHT), 0),
      SLOTS_PER_DAY - 1,
    );

    const minutesFromStart = slotIndex * SLOT_MINUTES;
    const baseStart = startOfDay(day);
    const slotStart = addMinutes(baseStart, minutesFromStart);

    if (payload.type === 'move') {
      const durationMinutes = Math.max(
        differenceInMinutes(event.end, event.start),
        SLOT_MINUTES,
      );
      const newStart = slotStart;
      const newEnd = addMinutes(newStart, durationMinutes);
      triggerEventUpdate({ ...event, start: newStart, end: newEnd });
      setSelectedEventId(event.id);
      return;
    }

    if (payload.type === 'resize-end') {
      // Ensure at least one slot
      let proposedEnd = addMinutes(baseStart, minutesFromStart + SLOT_MINUTES);
      const minEnd = addMinutes(event.start, SLOT_MINUTES);
      if (proposedEnd.getTime() < minEnd.getTime()) {
        proposedEnd = minEnd;
      }
      triggerEventUpdate({ ...event, end: proposedEnd });
      setSelectedEventId(event.id);
      return;
    }

    if (payload.type === 'resize-start') {
      let proposedStart = slotStart;
      const latestStart = addMinutes(event.end, -SLOT_MINUTES);
      if (proposedStart.getTime() > latestStart.getTime()) {
        proposedStart = latestStart;
      }
      triggerEventUpdate({ ...event, start: proposedStart });
      setSelectedEventId(event.id);
    }
  };

  const handleDayColumnDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleMonthDayDrop = (
    e: React.DragEvent<HTMLDivElement>,
    day: Date,
  ) => {
    e.preventDefault();
    const raw = e.dataTransfer.getData('application/x-calendar-event');
    if (!raw) return;

    let payload: DragPayload;
    try {
      payload = JSON.parse(raw) as DragPayload;
    } catch {
      return;
    }

    if (payload.type !== 'move') return;

    const event = events.find((evt) => evt.id === payload.eventId);
    if (!event) return;

    const dayStart = startOfDay(day);
    const originalDayStart = startOfDay(event.start);
    const minutesIntoDay = Math.max(
      0,
      differenceInMinutes(event.start, originalDayStart),
    );

    const newStart = addMinutes(dayStart, minutesIntoDay);
    const durationMinutes = Math.max(
      differenceInMinutes(event.end, event.start),
      SLOT_MINUTES,
    );
    const newEnd = addMinutes(newStart, durationMinutes);

    triggerEventUpdate({ ...event, start: newStart, end: newEnd });
    setSelectedEventId(event.id);
  };

  const handleMonthPopoverView = (event: CalendarEvent) => {
    setSelectedEventId(event.id);
    setModalMode('edit');
    setModalEvent(event);
    setModalOpen(true);
    setMonthPopover(null);
  };

  const handleMonthPopoverEdit = (event: CalendarEvent) => {
    setSelectedEventId(event.id);
    setModalMode('edit');
    setModalEvent(event);
    setModalOpen(true);
    setMonthPopover(null);
  };

  const handleMonthPopoverDelete = (event: CalendarEvent) => {
    triggerEventDelete(event.id);
    setMonthPopover(null);
  };

  const hasEvents = events.length > 0;

  return (
    <div className={cn('space-y-3 text-sm', className)}>
      {/* Header */}
      <CalendarHeader
        currentView={currentView}
        setCurrentView={setCurrentView}
        focusDate={focusDate}
        setFocusDate={setFocusDate}
        locale={locale}
        dateFnsLocale={dateFnsLocale}
        weekStart={weekStartState}
        strings={strings}
        accentRingClass={accentRingClass}
        hasEvents={hasEvents}
        monthPopoverOpen={monthPopoverOpen}
        setMonthPopoverOpen={setMonthPopoverOpen}
        onNewEventClick={handleNewEventClick}
        monthLabel={monthLabel}
      />

      {/* Views */}
      {currentView === 'month' && (
        <MonthView
          focusDate={focusDate}
          weekStart={weekStartState}
          events={events}
          locale={locale}
          theme={effectiveTheme}
          dateFnsLocale={dateFnsLocale}
          creatingRange={creatingRange}
          selectedEventId={selectedEventId}
          accentBgClass={accentBgClass}
          weekendTintClass={weekendTintClass}
          openInlineForSlot={openInlineForSlot}
          handleMonthDayDrop={handleMonthDayDrop}
          setMonthPopover={setMonthPopover}
          handleEventDragStart={handleEventDragStart}
          handleEventClick={handleEventClick}
        />
      )}
      {(currentView === 'week' || currentView === 'day') && (
        <WeekDayView
          view={currentView}
          focusDate={focusDate}
          weekStart={weekStartState}
          events={events}
          categories={categories}
          theme={effectiveTheme}
          locale={locale}
          strings={strings}
          dateFnsLocale={dateFnsLocale}
          creatingRange={creatingRange}
          selectedEventId={selectedEventId}
          accentBgClass={accentBgClass}
          weekendTintClass={weekendTintClass}
          gridLineClass={gridLineClass}
          weekSummaryExpanded={weekSummaryExpanded}
          setWeekSummaryExpanded={setWeekSummaryExpanded}
          openInlineForSlot={openInlineForSlot}
          handleDayColumnDrop={handleDayColumnDrop}
          handleDayColumnDragOver={handleDayColumnDragOver}
          handleEventDragStart={handleEventDragStart}
          handleEventClick={handleEventClick}
          handleResizeDragStart={handleResizeDragStart}
          timeSlots={TIME_OPTIONS}
        />
      )}

      {/* New event modal */}
      <Dialog open={modalOpen} onOpenChange={(open) => setModalOpen(open)}>
        <DialogContent
          className="max-w-lg rounded-xl"
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
          onFocusOutside={(e) => {
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
          <DialogHeader>
            <DialogTitle>
              {modalMode === 'create'
                ? strings.modalNewEventTitle
                : strings.modalEditEventTitle}
            </DialogTitle>
          </DialogHeader>
          <EventEditorForm
            mode={modalMode}
            initialTitle={modalEvent?.title}
            initialDescription={modalEvent?.description}
            initialStart={modalEvent?.start ?? focusDate}
            initialEnd={modalEvent?.end ?? addMinutes(focusDate, SLOT_MINUTES)}
            initialAllDay={modalEvent?.allDay}
            initialCategory={modalEvent?.category}
            initialCategories={modalEvent?.categories}
            initialColor={modalEvent?.color}
            categories={categories}
            weekStart={weekStartState}
            locale={locale}
            strings={strings}
            dateFnsLocale={dateFnsLocale}
            defaultColorClass={accentBgClass}
            onSubmit={handleModalSubmit}
            onCancel={() => setModalOpen(false)}
            onDelete={
              modalMode === 'edit' && modalEvent
                ? () => {
                    triggerEventDelete(modalEvent.id);
                    setModalOpen(false);
                  }
                : undefined
            }
          />
        </DialogContent>
      </Dialog>

      {/* Month day events popover */}
      <MonthDayEventsPopover
        className={classNames?.eventPopover}
        state={monthPopover}
        events={events}
        accentBgClass={accentBgClass}
        onClose={() => setMonthPopover(null)}
        locale={locale}
        dateFnsLocale={dateFnsLocale}
        onView={handleMonthPopoverView}
        onEdit={handleMonthPopoverEdit}
        onDelete={handleMonthPopoverDelete}
      />

      {/* Inline editor */}
      <InlineEventEditor
        className={classNames?.inlineEditor}
        state={inlineEditor}
        categories={categories}
        strings={strings}
        locale={locale}
        dateFnsLocale={dateFnsLocale}
        weekStart={weekStartState}
        accentColorClass={accentBgClass}
        onClose={handleInlineClose}
        onSubmit={handleInlineSubmit}
        onDelete={handleInlineDelete}
      />
    </div>
  );
});

CalendarScheduler.displayName = 'CalendarScheduler';

export { CalendarScheduler };
