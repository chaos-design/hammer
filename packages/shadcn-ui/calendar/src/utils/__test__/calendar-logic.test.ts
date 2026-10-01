import { enUS, zhCN } from 'date-fns/locale';
import { describe, expect, it } from 'vitest';
import type { CalendarEvent } from '../../types';
import {
  buildDaySegments,
  buildMonthSpans,
  formatDateForLocale,
  formatHeaderLabel,
  generateMonthDays,
  getEventCategoryIds,
  getEventCategoryLabels,
} from '../calendar-logic';

const event = (over: Partial<CalendarEvent> = {}): CalendarEvent => ({
  id: 'e1',
  title: 'Event',
  start: new Date(2026, 0, 5, 10, 0),
  end: new Date(2026, 0, 5, 11, 0),
  ...over,
});

/** Monday 2026-01-05, so `startOfWeek` results are easy to reason about. */
const days35 = generateMonthDays(new Date(2026, 0, 15), 'monday');

describe('generateMonthDays', () => {
  it('always returns 35 days', () => {
    expect(generateMonthDays(new Date(2026, 0, 15), 'monday')).toHaveLength(35);
    expect(generateMonthDays(new Date(2026, 0, 15), 'sunday')).toHaveLength(35);
  });

  it('starts on the configured first day of the week', () => {
    const monday = generateMonthDays(new Date(2026, 0, 15), 'monday');
    const sunday = generateMonthDays(new Date(2026, 0, 15), 'sunday');

    expect(monday[0].getDay()).toBe(1);
    expect(sunday[0].getDay()).toBe(0);
  });

  it('produces consecutive days', () => {
    for (let i = 1; i < days35.length; i++) {
      const diff = days35[i].getTime() - days35[i - 1].getTime();

      expect(diff).toBe(24 * 60 * 60 * 1000);
    }
  });

  it('contains the first of the focused month', () => {
    const firstOfMonth = new Date(2026, 0, 1);

    expect(days35.some((d) => d.getMonth() === 0 && d.getDate() === 1)).toBe(
      true,
    );
    expect(days35.some((d) => d.getTime() === firstOfMonth.getTime())).toBe(
      true,
    );
  });
});

describe('formatHeaderLabel', () => {
  it('formats a month header', () => {
    expect(
      formatHeaderLabel(new Date(2026, 0, 15), 'month', 'en', enUS, 'monday'),
    ).toBe('January 2026');
  });

  it('formats a Chinese month header', () => {
    expect(
      formatHeaderLabel(new Date(2026, 0, 15), 'month', 'zh', zhCN, 'monday'),
    ).toBe('2026 年 01 月');
  });

  it('formats a week header', () => {
    const label = formatHeaderLabel(
      new Date(2026, 0, 15),
      'week',
      'en',
      enUS,
      'monday',
    );

    expect(label).toBe('Jan 12 - Jan 18, 2026');
  });

  it('formats a day header', () => {
    expect(
      formatHeaderLabel(new Date(2026, 0, 15), 'day', 'en', enUS, 'monday'),
    ).toBe('Thursday, Jan 15, 2026');
  });
});

describe('formatDateForLocale', () => {
  it('uses a short pattern per locale', () => {
    const date = new Date(2026, 0, 5);

    expect(formatDateForLocale(date, 'en', enUS)).toBe('Jan 5');
    expect(formatDateForLocale(date, 'zh', zhCN)).toBe('01-05');
  });
});

describe('buildMonthSpans', () => {
  it('places a single-day event in one cell', () => {
    const rows = buildMonthSpans(days35, [event()]);
    const flat = rows.flat();

    expect(flat).toHaveLength(1);
    expect(flat[0].colStart).toBe(flat[0].colEnd);
    expect(flat[0].laneCount).toBe(1);
  });

  it('spans a multi-day event across columns', () => {
    const rows = buildMonthSpans(days35, [
      event({
        start: new Date(2026, 0, 5, 9, 0),
        end: new Date(2026, 0, 7, 9, 0),
      }),
    ]);
    const flat = rows.flat();

    expect(flat).toHaveLength(1);
    expect(flat[0].colEnd - flat[0].colStart).toBe(2);
  });

  it('allocates distinct lanes to overlapping events', () => {
    const rows = buildMonthSpans(days35, [
      event({
        id: 'a',
        start: new Date(2026, 0, 5, 9, 0),
        end: new Date(2026, 0, 5, 10, 0),
      }),
      event({
        id: 'b',
        start: new Date(2026, 0, 5, 10, 0),
        end: new Date(2026, 0, 5, 11, 0),
      }),
    ]);
    const flat = rows.flat();

    expect(flat).toHaveLength(2);
    expect(flat.every((s) => s.laneCount === 2)).toBe(true);
    expect(new Set(flat.map((s) => s.lane)).size).toBe(2);
  });

  it('splits an event spanning a week boundary into per-row spans', () => {
    const rows = buildMonthSpans(days35, [
      event({
        start: new Date(2026, 0, 5, 9, 0),
        end: new Date(2026, 0, 12, 9, 0),
      }),
    ]);

    // The grid starts Mon 29 Dec, so 5 Jan is index 7 (row 1) and
    // 12 Jan is index 14 (row 2): one span per row, both starting at col 0.
    expect(rows[1]).toHaveLength(1);
    expect(rows[1][0].colStart).toBe(0);
    expect(rows[1][0].colEnd).toBe(6);

    expect(rows[2]).toHaveLength(1);
    expect(rows[2][0].colStart).toBe(0);

    expect(rows[0]).toHaveLength(0);
    expect(rows.flat()).toHaveLength(2);
  });

  it('ignores events outside the visible range', () => {
    const rows = buildMonthSpans(days35, [
      event({ start: new Date(2025, 5, 1), end: new Date(2025, 5, 2) }),
    ]);

    expect(rows.flat()).toHaveLength(0);
  });
});

describe('buildDaySegments', () => {
  const day = new Date(2026, 0, 5);

  it('positions an event by its start time', () => {
    const segments = buildDaySegments(day, [event()]);

    expect(segments).toHaveLength(1);
    expect(segments[0].top).toBeGreaterThan(0);
    expect(segments[0].height).toBeGreaterThan(0);
  });

  it('clamps an event that started earlier to the start of the day', () => {
    const segments = buildDaySegments(day, [
      event({
        start: new Date(2026, 0, 4, 22, 0),
        end: new Date(2026, 0, 5, 1, 0),
      }),
    ]);

    expect(segments[0].top).toBe(0);
  });

  it('gives a minimum height to a zero-length event', () => {
    const segments = buildDaySegments(day, [
      event({
        start: new Date(2026, 0, 5, 10, 0),
        end: new Date(2026, 0, 5, 10, 0),
      }),
    ]);

    expect(segments[0].height).toBeGreaterThan(0);
  });

  it('allocates lanes to concurrent events', () => {
    const segments = buildDaySegments(day, [
      event({
        id: 'a',
        start: new Date(2026, 0, 5, 9, 0),
        end: new Date(2026, 0, 5, 11, 0),
      }),
      event({
        id: 'b',
        start: new Date(2026, 0, 5, 10, 0),
        end: new Date(2026, 0, 5, 12, 0),
      }),
    ]);

    expect(segments).toHaveLength(2);
    expect(segments.every((s) => s.laneCount === 2)).toBe(true);
  });

  it('reuses a lane once the previous event ended', () => {
    const segments = buildDaySegments(day, [
      event({
        id: 'a',
        start: new Date(2026, 0, 5, 9, 0),
        end: new Date(2026, 0, 5, 10, 0),
      }),
      event({
        id: 'b',
        start: new Date(2026, 0, 5, 11, 0),
        end: new Date(2026, 0, 5, 12, 0),
      }),
    ]);

    expect(segments.every((s) => s.laneCount === 1)).toBe(true);
  });

  it('ignores events on other days', () => {
    const segments = buildDaySegments(day, [
      event({ start: new Date(2026, 0, 6), end: new Date(2026, 0, 6, 1) }),
    ]);

    expect(segments).toHaveLength(0);
  });
});

describe('category helpers', () => {
  const categories = [
    { id: 'work', label: 'Work', colorClass: 'bg-blue-500' },
    { id: 'life', label: 'Life', colorClass: 'bg-green-500' },
  ];

  it('prefers `categories` over `category`', () => {
    expect(
      getEventCategoryIds(event({ category: 'work', categories: ['life'] })),
    ).toEqual(['life']);
  });

  it('falls back to `category`', () => {
    expect(getEventCategoryIds(event({ category: 'work' }))).toEqual(['work']);
  });

  it('returns an empty list when neither is set', () => {
    expect(getEventCategoryIds(event())).toEqual([]);
  });

  it('maps ids to labels', () => {
    expect(
      getEventCategoryLabels(
        event({ categories: ['work', 'unknown'] }),
        categories,
      ),
    ).toEqual(['Work', 'unknown']);
  });

  it('returns the raw ids when no categories are supplied', () => {
    expect(getEventCategoryLabels(event({ category: 'work' }))).toEqual([
      'work',
    ]);
  });
});
