import type { ThemeConfig } from './theme';

export type CalendarView = 'month' | 'week' | 'day';
export type WeekStart = 'sunday' | 'monday';
export type UiLocale = 'en' | 'zh';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  color?: string; // tailwind background class for the event chip or hex when custom
  category?: string;
  categories?: string[];
  allDay?: boolean;
}

export interface CalendarCategory {
  id: string;
  label: string;
  colorClass: string;
}

export interface CalendarSchedulerProps {
  events?: CalendarEvent[];
  defaultEvents?: CalendarEvent[];
  defaultView?: CalendarView;
  weekStart?: WeekStart;
  initialDate?: Date;
  onEventCreate?: (event: CalendarEvent) => void;
  onEventUpdate?: (event: CalendarEvent) => void;
  onEventDelete?: (id: string) => void;
  theme?: 'light' | 'dark';
  onThemeToggle?: (next: 'light' | 'dark') => void;
  categories?: CalendarCategory[];
  locale?: UiLocale;
  onLocaleChange?: (next: UiLocale) => void;
  themeConfig?: ThemeConfig;
}

export interface CalendarSchedulerRef {
  getEvents: () => CalendarEvent[];
  setEvents: (events: CalendarEvent[]) => void;
  addEvent: (event: CalendarEvent) => void;
  updateEvent: (event: CalendarEvent) => void;
  deleteEvent: (id: string) => void;
}

export interface CalendarStrings {
  scheduleLabel: string;
  monthLabel: string;
  weekLabel: string;
  dayLabel: string;
  yearLabel: string;
  todayLabel: string;
  newEventLabel: string;
  weekStartsOnLabel: string;
  weekStartSundayLabel: string;
  weekStartMondayLabel: string;
  allDayLabel: string;
  categoryLabel: string;
  colorLabel: string;
  titleLabel: string;
  descriptionLabel: string;
  titlePlaceholder: string;
  descriptionPlaceholder: string;
  dateRangeLabel: string;
  timeRangeLabel: string;
  startTimeLabel: string;
  endTimeLabel: string;
  recommendedLabel: string;
  noneLabel: string;
  inlineNewEventTitle: string;
  inlineEventDetailsTitle: string;
  modalNewEventTitle: string;
  modalEditEventTitle: string;
  modalDescription: string;
  deleteLabel: string;
  cancelLabel: string;
  createLabel: string;
  saveLabel: string;
  noEventsMessage: string;
  clickToAddLabel: string;
  allDayRowLabel: string;
  todayBadgeLabel: string;
  localeToggleLabel: string;
  localeEnLabel: string;
  localeZhLabel: string;
  prevYearLabel: string;
  nextYearLabel: string;
  accentLabel: string;
  accentSkyLabel: string;
  accentEmeraldLabel: string;
  accentPurpleLabel: string;
  accentAmberLabel: string;
  accentRoseLabel: string;
  currentMonthLabel: string;
}

export type AccentColor = 'sky' | 'emerald' | 'purple' | 'amber' | 'rose';

export interface MonthSpan {
  event: CalendarEvent;
  row: number;
  colStart: number;
  colEnd: number;
  lane: number;
  laneCount: number;
}

export interface EventSegment {
  event: CalendarEvent;
  start: Date;
  end: Date;
  top: number;
  height: number;
  lane: number;
  laneCount: number;
}

export interface EventEditorValues {
  title: string;
  description: string;
  start: Date;
  end: Date;
  allDay: boolean;
  category?: string;
  categories?: string[];
  colorClass?: string;
}

export type DragKind = 'move' | 'resize-start' | 'resize-end';

export interface DragPayload {
  type: DragKind;
  eventId: string;
}

export interface InlineEditorState {
  open: boolean;
  mode: 'create' | 'edit';
  anchorEl: HTMLElement | null;
  anchorOffset: { x: number; y: number };
  start: Date;
  end: Date;
  event?: CalendarEvent;
}

export interface MonthPopoverState {
  day: Date;
  anchorRect: DOMRect;
}
