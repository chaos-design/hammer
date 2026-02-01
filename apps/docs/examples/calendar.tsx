'use client';

import {
  Calendar as BaseCalendar,
  type CalendarEvent,
  DEFAULT_THEME,
  type ThemeConfig,
} from '@chaos-design/calendar';
import { cn } from '@chaos-design/shadcn-kits';
import { addDays, addMinutes, startOfDay, startOfMonth } from 'date-fns';
import { Settings, X } from 'lucide-react';
import { useMemo, useState } from 'react';

export function Calendar() {
  const initialDate = new Date();

  const buildSeedEvents = () => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const baseDay = startOfDay(addDays(monthStart, 1));
    const dayTwo = addDays(baseDay, 1);
    const dayThree = addDays(baseDay, 2);
    const dayFour = addDays(baseDay, 3);
    const dayTen = addDays(baseDay, 9);
    const dayTwelve = addDays(baseDay, 11);

    return [
      {
        id: '1',
        title: '每日站会',
        start: addMinutes(baseDay, 9 * 60 + 30),
        end: addMinutes(baseDay, 10 * 60),
        color: 'bg-red-600',
        allDay: true,
      },
      {
        id: '2',
        title: '迭代规划',
        start: addMinutes(dayTwo, 14 * 60),
        end: addMinutes(dayTwo, 16 * 60),
        color: 'bg-amber-500',
        allDay: true,
      },
      {
        id: '3',
        title: '深度工作',
        start: addMinutes(baseDay, 10 * 60 + 30),
        end: addMinutes(baseDay, 12 * 60),
        color: 'bg-orange-600',
        allDay: true,
      },
      {
        id: '4',
        title: '商务出差',
        start: addMinutes(dayThree, 8 * 60),
        end: addMinutes(dayFour, 18 * 60),
        color: 'bg-emerald-600',
        allDay: false,
      },
      {
        id: '5',
        title: '公司团建',
        start: dayTen,
        end: addDays(dayTen, 1),
        color: 'bg-blue-600',
        allDay: true,
      },
      {
        id: '6',
        title: '1:1 面谈',
        start: addMinutes(dayTwelve, 11 * 60),
        end: addMinutes(dayTwelve, 11 * 60 + 30),
        color: 'bg-red-600',
        allDay: false,
      },
    ] satisfies CalendarEvent[];
  };

  const [events, setEvents] = useState<CalendarEvent[]>(() =>
    buildSeedEvents(),
  );
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [locale, setLocale] = useState<'zh' | 'en'>('zh');
  const [weekStart, setWeekStart] = useState<'sunday' | 'monday'>('sunday');
  const [defaultView, setDefaultView] = useState<'month' | 'week' | 'day'>(
    'month',
  );
  const [compact, setCompact] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(true);

  const themeConfig = useMemo<ThemeConfig>(() => {
    if (!compact) return DEFAULT_THEME;
    return {
      ...DEFAULT_THEME,
      eventRadius: 'sm',
      moreCountThreshold: 2,
      weekSummaryEnabled: false,
    };
  }, [compact]);

  return (
    <div
      className={cn(
        'relative p-8 pt-15 h-[800px] w-full overflow-hidden border bg-background shadow-sm',
        theme === 'dark' && 'dark',
      )}
    >
      {!settingsOpen && (
        <button
          type="button"
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-600 shadow-sm transition hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:text-zinc-50"
          onClick={() => setSettingsOpen(true)}
        >
          <Settings className="h-4 w-4" />
        </button>
      )}
      {settingsOpen && (
        <div className="absolute right-4 top-4 z-10 w-[240px] rounded-xl border border-zinc-200 bg-white/95 p-4 shadow-lg backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              <Settings className="h-4 w-4" />
              配置
            </div>
            <button
              type="button"
              className="flex h-7 w-7 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-500 shadow-sm transition hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"
              onClick={() => setSettingsOpen(false)}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-3 text-sm">
            <div className="space-y-1">
              <div className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                主题
              </div>
              <select
                className="h-9 w-full rounded-md border border-zinc-200 bg-white px-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
                value={theme}
                onChange={(e) => setTheme(e.target.value as 'light' | 'dark')}
              >
                <option value="light">明亮</option>
                <option value="dark">深色</option>
              </select>
            </div>

            <div className="space-y-1">
              <div className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                语言
              </div>
              <select
                className="h-9 w-full rounded-md border border-zinc-200 bg-white px-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
                value={locale}
                onChange={(e) => setLocale(e.target.value as 'zh' | 'en')}
              >
                <option value="zh">中文</option>
                <option value="en">英文</option>
              </select>
            </div>

            <div className="space-y-1">
              <div className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                周起始
              </div>
              <select
                className="h-9 w-full rounded-md border border-zinc-200 bg-white px-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
                value={weekStart}
                onChange={(e) =>
                  setWeekStart(e.target.value as 'sunday' | 'monday')
                }
              >
                <option value="sunday">周日</option>
                <option value="monday">周一</option>
              </select>
            </div>

            <div className="space-y-1">
              <div className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                默认视图
              </div>
              <select
                className="h-9 w-full rounded-md border border-zinc-200 bg-white px-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
                value={defaultView}
                onChange={(e) =>
                  setDefaultView(e.target.value as 'month' | 'week' | 'day')
                }
              >
                <option value="month">月</option>
                <option value="week">周</option>
                <option value="day">日</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                启用紧凑视图
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={compact}
                onClick={() => setCompact((prev) => !prev)}
                className={cn(
                  'relative h-5 w-9 rounded-full transition-colors',
                  compact
                    ? 'bg-zinc-900 dark:bg-zinc-100'
                    : 'bg-zinc-200 dark:bg-zinc-800',
                )}
              >
                <span
                  className={cn(
                    'absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white transition-transform',
                    compact && 'translate-x-4 bg-zinc-50',
                  )}
                />
              </button>
            </div>
          </div>
        </div>
      )}
      <BaseCalendar
        events={events}
        defaultView={defaultView}
        initialDate={initialDate}
        locale={locale}
        theme={theme}
        weekStart={weekStart}
        themeConfig={themeConfig}
        onEventCreate={(e) => setEvents((prev) => [...prev, e])}
        onEventUpdate={(e) =>
          setEvents((prev) => prev.map((ev) => (ev.id === e.id ? e : ev)))
        }
        onEventDelete={(id) =>
          setEvents((prev) => prev.filter((ev) => ev.id !== id))
        }
      />
    </div>
  );
}

export default Calendar;
