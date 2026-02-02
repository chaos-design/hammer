import type {AccentColor, CalendarCategory, CalendarStrings, UiLocale} from './types';

export const STRINGS: Record<UiLocale, CalendarStrings> = {
  en: {
    scheduleLabel: 'Schedule',
    monthLabel: 'Month',
    weekLabel: 'Week',
    dayLabel: 'Day',
    yearLabel: 'Year',
    todayLabel: 'Today',
    newEventLabel: 'New event',
    weekStartsOnLabel: 'Week starts on',
    weekStartSundayLabel: 'Sunday',
    weekStartMondayLabel: 'Monday',
    allDayLabel: 'All-day',
    categoryLabel: 'Urgency Level',
    colorLabel: 'Color',
    titleLabel: 'Title',
    descriptionLabel: 'Description',
    titlePlaceholder: 'What are you planning?',
    descriptionPlaceholder: 'Optional details, links, attendees...',
    dateRangeLabel: 'Date range',
    timeRangeLabel: 'Time range',
    startTimeLabel: 'Start time',
    endTimeLabel: 'End time',
    recommendedLabel: 'Recommended',
    noneLabel: 'None',
    inlineNewEventTitle: 'New event',
    inlineEventDetailsTitle: 'Event details',
    modalNewEventTitle: 'New event',
    modalEditEventTitle: 'Edit event',
    modalDescription: 'Use this form to quickly add events. Press Enter to submit or Esc to close.',
    deleteLabel: 'Delete',
    cancelLabel: 'Cancel',
    createLabel: 'Create',
    saveLabel: 'Save',
    noEventsMessage:
      'No events yet. Use "New event" or click any day/time slot to start scheduling.',
    clickToAddLabel: 'Click to add',
    allDayRowLabel: 'All-day',
    todayBadgeLabel: 'Today',
    localeToggleLabel: 'Language',
    localeEnLabel: 'EN',
    localeZhLabel: '中文',
    prevYearLabel: 'Prev Year',
    nextYearLabel: 'Next Year',
    accentLabel: 'Accent color',
    accentSkyLabel: 'Sky',
    accentEmeraldLabel: 'Emerald',
    accentPurpleLabel: 'Purple',
    accentAmberLabel: 'Amber',
    accentRoseLabel: 'Rose',
    currentMonthLabel: 'Current Month',
  },
  zh: {
    scheduleLabel: '日程',
    monthLabel: '月',
    weekLabel: '周',
    dayLabel: '日',
    yearLabel: '年',
    todayLabel: '今天',
    newEventLabel: '新建日程',
    weekStartsOnLabel: '周起始',
    weekStartSundayLabel: '周日',
    weekStartMondayLabel: '周一',
    allDayLabel: '全天',
    categoryLabel: '紧急程度',
    colorLabel: '颜色',
    titleLabel: '标题',
    descriptionLabel: '描述',
    titlePlaceholder: '要安排什么？',
    descriptionPlaceholder: '可选：详情、链接、参与人…',
    dateRangeLabel: '日期范围',
    timeRangeLabel: '时间范围',
    startTimeLabel: '开始时间',
    endTimeLabel: '结束时间',
    recommendedLabel: '推荐',
    noneLabel: '无',
    inlineNewEventTitle: '新建日程',
    inlineEventDetailsTitle: '日程详情',
    modalNewEventTitle: '新建日程',
    modalEditEventTitle: '编辑日程',
    modalDescription: '通过此表单快速创建日程。回车提交，Esc 关闭。',
    deleteLabel: '删除',
    cancelLabel: '取消',
    createLabel: '创建',
    saveLabel: '保存',
    noEventsMessage: '暂无日程。点击“新建日程”或任意日期/时间开始创建。',
    clickToAddLabel: '点击创建',
    allDayRowLabel: '全天',
    todayBadgeLabel: '今天',
    localeToggleLabel: '语言',
    localeEnLabel: 'EN',
    localeZhLabel: '中文',
    prevYearLabel: '上一年',
    nextYearLabel: '下一年',
    accentLabel: '主题色',
    accentSkyLabel: '天蓝',
    accentEmeraldLabel: '翠绿',
    accentPurpleLabel: '紫色',
    accentAmberLabel: '琥珀',
    accentRoseLabel: '玫瑰',
    currentMonthLabel: '当前月',
  },
};

export const SLOT_MINUTES = 30;
export const SLOTS_PER_DAY = (24 * 60) / SLOT_MINUTES;
export const SLOT_HEIGHT = 28; // px per 30 minutes

export const ACCENT_BG_CLASSES: Record<AccentColor, string> = {
  sky: 'bg-sky-500',
  emerald: 'bg-emerald-500',
  purple: 'bg-purple-500',
  amber: 'bg-amber-500',
  rose: 'bg-rose-500',
};

export const ACCENT_RING_CLASSES: Record<AccentColor, string> = {
  sky: 'ring-sky-500 dark:ring-sky-400',
  emerald: 'ring-emerald-500 dark:ring-emerald-400',
  purple: 'ring-purple-500 dark:ring-purple-400',
  amber: 'ring-amber-500 dark:ring-amber-400',
  rose: 'ring-rose-500 dark:ring-rose-400',
};

export const RECOMMENDED_COLOR_CLASSES = [
  'bg-[#E02020]', // 猩红 (Scarlet) - Bright Red
  'bg-[#FA8c35]', // 橙皮 (Orange Peel) - Bright Orange
  'bg-[#F2E009]', // 柠檬黄 (Lemon Yellow) - Bright Yellow
  'bg-[#44CEF6]', // 蓝 (Blue) - Cyan Blue
  'bg-[#1FBCF5]', // 湖蓝 (Lake Blue) - Bright Blue
  'bg-[#20A162]', // 葱绿 (Scallion Green) - Bright Green
  'bg-[#B15BFF]', // 紫 (Purple) - Bright Purple
  'bg-[#FF3399]', // 桃红 (Peach Red) - Hot Pink
] as const;

export const TIME_OPTIONS = Array.from({length: SLOTS_PER_DAY}).map((_, index) => {
  const minutes = index * SLOT_MINUTES;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return {
    label: `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`,
    index,
  };
});

export const RECOMMENDED_TIME_RANGES = [
  {start: '09:00', end: '10:00'},
  {start: '10:30', end: '12:00'},
  {start: '14:00', end: '15:00'},
  {start: '14:00', end: '16:00'},
];

export const DEFAULT_CATEGORIES: CalendarCategory[] = [
  {id: '1', label: 'P0', colorClass: 'bg-[#dc2626]'}, // red-600
  {id: '2', label: 'P1', colorClass: 'bg-[#ca8a04]'}, // yellow-600
  {id: '3', label: 'P2', colorClass: 'bg-[#ea580c]'}, // orange-600
  {id: '4', label: 'P3', colorClass: 'bg-[#2563eb]'}, // blue-600
  {id: '5', label: 'P4', colorClass: 'bg-[#059669]'}, // emerald-600
];
