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
  /**
   * @description: Custom class name for the scheduler
   * @default undefined
   */
  className?: string;
  /**
   * @description: List of calendar events
   * @default undefined
   */
  events?: CalendarEvent[];
  /**
   * @description: Default events when uncontrolled
   * @default []
   */
  defaultEvents?: CalendarEvent[];
  /**
   * @description: Default view (month, week, day)
   * @default 'month'
   */
  defaultView?: CalendarView;
  /**
   * @description: Start day of the week
   * @default 'monday'
   */
  weekStart?: WeekStart;
  /**
   * @description: Initial focus date
   * @default new Date()
   */
  initialDate?: Date;
  /**
   * @description: Callback when an event is created
   * @default undefined
   */
  onEventCreate?: (event: CalendarEvent) => void;
  /**
   * @description: Callback when an event is updated
   * @default undefined
   */
  onEventUpdate?: (event: CalendarEvent) => void;
  /**
   * @description: Callback when an event is deleted
   * @default undefined
   */
  onEventDelete?: (id: string) => void;
  /**
   * @description: Theme mode
   * @default 'light'
   */
  theme?: 'light' | 'dark';
  /**
   * @description: Callback when theme changes
   * @default undefined
   */
  onThemeToggle?: (next: 'light' | 'dark') => void;
  /**
   * @description: List of categories for events
   * @default DEFAULT_CATEGORIES
   */
  categories?: CalendarCategory[];
  /**
   * @description: UI Locale
   * @default 'en'
   */
  locale?: UiLocale;
  /**
   * @description: Callback when locale changes
   * @default undefined
   */
  onLocaleChange?: (next: UiLocale) => void;
  /**
   * @description: Custom theme configuration
   * @default DEFAULT_THEME
   */
  themeConfig?: ThemeConfig;
  /**
   * @description: Custom class names for internal components
   * @default undefined
   */
  classNames?: {
    container?: string;
    header?: string;
    monthView?: string;
    weekView?: string;
    dayView?: string;
    eventModal?: string;
    eventPopover?: string;
    inlineEditor?: string;
  };
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
