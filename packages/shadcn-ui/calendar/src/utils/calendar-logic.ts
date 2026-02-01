import type { Locale as DateFnsLocale } from 'date-fns';
import {
  addDays,
  differenceInMinutes,
  endOfDay,
  format,
  isBefore,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { SLOT_HEIGHT, SLOT_MINUTES } from '../constants';
import type {
  CalendarCategory,
  CalendarEvent,
  CalendarView,
  EventSegment,
  MonthSpan,
  UiLocale,
  WeekStart,
} from '../types';

// Generate a 35-day month grid aligned with configured week start
export function generateMonthDays(
  focusDate: Date,
  weekStart: WeekStart,
): Date[] {
  const startOfMonthDate = startOfMonth(focusDate);
  const weekStartsOn = weekStart === 'sunday' ? 0 : 1;
  const firstGridDay = startOfWeek(startOfMonthDate, { weekStartsOn });

  const days: Date[] = [];
  for (let i = 0; i < 35; i += 1) {
    days.push(addDays(firstGridDay, i));
  }
  return days;
}

export function formatHeaderLabel(
  focusDate: Date,
  currentView: CalendarView,
  locale: UiLocale,
  dateFnsLocale: DateFnsLocale,
  weekStart: WeekStart,
): string {
  if (currentView === 'month') {
    if (locale === 'zh') {
      return format(focusDate, 'yyyy-MM-dd', { locale: dateFnsLocale });
    }
    return format(focusDate, 'MMMM yyyy', { locale: dateFnsLocale });
  }

  if (currentView === 'week') {
    const weekStartsOn = weekStart === 'sunday' ? 0 : 1;
    const start = startOfWeek(focusDate, { weekStartsOn });
    const end = addDays(start, 6);

    if (locale === 'zh') {
      const startLabel = format(start, 'yyyy-MM-dd', { locale: dateFnsLocale });
      const endLabel = format(end, 'yyyy-MM-dd', { locale: dateFnsLocale });
      return `${startLabel} - ${endLabel}`;
    }

    const startLabel = format(start, 'MMM d', { locale: dateFnsLocale });
    const endLabel = format(end, 'MMM d, yyyy', { locale: dateFnsLocale });
    return `${startLabel} - ${endLabel}`;
  }

  // Day view
  if (locale === 'zh') {
    return format(focusDate, 'yyyy-MM-dd', { locale: dateFnsLocale });
  }

  return format(focusDate, 'EEEE, MMM d, yyyy', { locale: dateFnsLocale });
}

export function formatDateForLocale(
  date: Date,
  localeCode: UiLocale,
  dateFnsLocale: DateFnsLocale,
) {
  const pattern = localeCode === 'zh' ? 'MM-dd' : 'MMM d';
  return format(date, pattern, { locale: dateFnsLocale });
}

// Compute continuous month-view spans per row with lane allocation
export function buildMonthSpans(
  days: Date[],
  events: CalendarEvent[],
): MonthSpan[][] {
  const rows = 5;
  const spansByRow: MonthSpan[][] = Array.from({ length: rows }, () => []);

  type RawSpan = {
    event: CalendarEvent;
    row: number;
    colStart: number;
    colEnd: number;
  };

  const rawByRow: RawSpan[][] = Array.from({ length: rows }, () => []);

  events.forEach((event) => {
    let firstIndex = -1;
    let lastIndex = -1;

    for (let i = 0; i < days.length; i += 1) {
      const dayStart = startOfDay(days[i]);
      const dayEnd = endOfDay(days[i]);
      if (event.end > dayStart && event.start < dayEnd) {
        if (firstIndex === -1) firstIndex = i;
        lastIndex = i;
      }
    }

    if (firstIndex === -1 || lastIndex === -1) return;

    for (let row = 0; row < rows; row += 1) {
      const rowStartIndex = row * 7;
      const rowEndIndex = rowStartIndex + 6;
      if (firstIndex > rowEndIndex || lastIndex < rowStartIndex) continue;

      const overlapStart = Math.max(firstIndex, rowStartIndex);
      const overlapEnd = Math.min(lastIndex, rowEndIndex);
      const colStart = overlapStart - rowStartIndex;
      const colEnd = overlapEnd - rowStartIndex;

      rawByRow[row].push({ event, row, colStart, colEnd });
    }
  });

  for (let row = 0; row < rows; row += 1) {
    const rowSpans = rawByRow[row];
    if (!rowSpans.length) continue;

    rowSpans.sort((a, b) => {
      if (a.colStart !== b.colStart) return a.colStart - b.colStart;
      const aLen = a.colEnd - a.colStart;
      const bLen = b.colEnd - b.colStart;
      return bLen - aLen;
    });

    const laneEndCols: number[] = [];
    const withLane: MonthSpan[] = [];

    for (const span of rowSpans) {
      let lane = 0;
      while (lane < laneEndCols.length && laneEndCols[lane] >= span.colStart) {
        lane += 1;
      }
      if (lane === laneEndCols.length) {
        laneEndCols.push(span.colEnd);
      } else {
        laneEndCols[lane] = span.colEnd;
      }

      withLane.push({ ...span, lane, laneCount: 0 });
    }

    const laneCount = laneEndCols.length || 1;
    spansByRow[row] = withLane.map((span) => ({ ...span, laneCount }));
  }

  return spansByRow;
}

// Compute event segments for a single day, with collision lanes
export function buildDaySegments(
  day: Date,
  events: CalendarEvent[],
): EventSegment[] {
  const dayStart = startOfDay(day);
  const dayEnd = endOfDay(day);

  // Filter events intersecting this day
  const overlapping = events.filter(
    (event) => event.end > dayStart && event.start < dayEnd,
  );

  const rawSegments = overlapping.map((event) => {
    const segStart = isBefore(event.start, dayStart) ? dayStart : event.start;
    const segEnd = isBefore(dayEnd, event.end) ? dayEnd : event.end;

    const startMinutes = Math.max(0, differenceInMinutes(segStart, dayStart));
    const endMinutes = Math.min(24 * 60, differenceInMinutes(segEnd, dayStart));

    const top = (startMinutes / SLOT_MINUTES) * SLOT_HEIGHT;
    const height = Math.max(
      ((endMinutes - startMinutes) / SLOT_MINUTES) * SLOT_HEIGHT,
      SLOT_HEIGHT,
    );

    return { event, start: segStart, end: segEnd, top, height };
  });

  // Sort by start to assign lanes
  rawSegments.sort((a, b) => a.start.getTime() - b.start.getTime());

  const laneEndTimes: Date[] = [];
  const segments: EventSegment[] = [];

  for (const seg of rawSegments) {
    let laneIndex = 0;
    while (
      laneIndex < laneEndTimes.length &&
      laneEndTimes[laneIndex].getTime() > seg.start.getTime()
    ) {
      laneIndex += 1;
    }

    if (laneIndex === laneEndTimes.length) {
      laneEndTimes.push(seg.end);
    } else {
      laneEndTimes[laneIndex] = seg.end;
    }

    segments.push({
      ...seg,
      lane: laneIndex,
      laneCount: 0, // temporary, filled below
    });
  }

  const totalLanes = laneEndTimes.length || 1;
  return segments.map((seg) => ({ ...seg, laneCount: totalLanes }));
}

export function getEventCategoryIds(event: CalendarEvent): string[] {
  if (event.categories && event.categories.length) return event.categories;
  if (event.category) return [event.category];
  return [];
}

export function getEventCategoryLabels(
  event: CalendarEvent,
  categories?: CalendarCategory[],
): string[] {
  const ids = getEventCategoryIds(event);
  if (!categories || !categories.length) return ids;
  return ids.map((id) => categories.find((cat) => cat.id === id)?.label ?? id);
}
