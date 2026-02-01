import { addDays, addMinutes, startOfDay, startOfMonth } from 'date-fns';
import { CalendarRange, Settings } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { CalendarCategory, CalendarEvent, CalendarView, UiLocale, WeekStart } from '../../src';
import { CalendarScheduler } from '../../src';
import { Button } from '../../src/components/ui/button';
import { Card } from '../../src/components/ui/card';
import { Label } from '../../src/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../src/components/ui/select';
import { Switch } from '../../src/components/ui/switch';
import { cn } from '../../src/utils';
import { DEFAULT_THEME, type ThemeConfig } from '../../src/theme';

// ----- Demo App wrapper -----

const demoCategories: CalendarCategory[] = [
  { id: '1', label: 'Level 1', colorClass: 'bg-red-600' },
  { id: '2', label: 'Level 2', colorClass: 'bg-yellow-600' },
  { id: '3', label: 'Level 3', colorClass: 'bg-orange-600' },
  { id: '4', label: 'Level 4', colorClass: 'bg-blue-600' },
  { id: '5', label: 'Level 5', colorClass: 'bg-emerald-600' },
];

function buildSeedEvents(): CalendarEvent[] {
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
      id: 'evt-standup',
      title: '每日站会',
      description: '团队同步会议',
      start: addMinutes(baseDay, 9 * 60 + 30),
      end: addMinutes(baseDay, 10 * 60),
      category: '1',
      color: 'bg-red-600',
    },
    {
      id: 'evt-planning',
      title: '迭代规划',
      description: '规划下个迭代的任务列表',
      start: addMinutes(dayTwo, 14 * 60),
      end: addMinutes(dayTwo, 16 * 60),
      category: '2',
      color: 'bg-yellow-600',
    },
    {
      id: 'evt-focus',
      title: '深度工作',
      description: '专注处理核心任务',
      start: addMinutes(baseDay, 10 * 60 + 30),
      end: addMinutes(baseDay, 12 * 60),
      category: '3',
      color: 'bg-orange-600',
    },
    {
      id: 'evt-trip',
      title: '商务出差',
      description: '客户拜访与现场会议',
      start: addMinutes(dayThree, 8 * 60),
      end: addMinutes(dayFour, 18 * 60),
      category: '5',
      color: 'bg-emerald-600',
      allDay: false,
    },
    {
      id: 'evt-all-day',
      title: '公司团建',
      description: '全天研讨会与团队建设',
      start: dayTen,
      end: addDays(dayTen, 1),
      allDay: true,
      category: '4',
      color: 'bg-blue-600',
    },
    {
      id: 'evt-1on1',
      title: '1:1 面谈',
      description: '职业发展与反馈沟通',
      start: addMinutes(dayTwelve, 11 * 60),
      end: addMinutes(dayTwelve, 11 * 60 + 30),
      category: '1',
      color: 'bg-red-600',
    },
  ];
}

function App() {
  const [events, setEvents] = useState<CalendarEvent[]>(() =>
    buildSeedEvents(),
  );
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [locale, setLocale] = useState<UiLocale>('zh');
  const [themeConfig] = useState<ThemeConfig>(() => DEFAULT_THEME);

  // Config state
  const [weekStart, setWeekStart] = useState<WeekStart>('sunday');
  const [defaultView, setDefaultView] = useState<CalendarView>('month');
  const [showCategories, setShowCategories] = useState(true);
  const [showConfig, setShowConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('demo-config-open');
      return saved === null ? true : saved === 'true';
    } catch {
      return true;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('demo-config-open', String(showConfig));
    } catch (e) {
      console.warn('Failed to save config state', e);
    }
  }, [showConfig]);

  return (
    <div className={cn(theme === 'dark' && 'dark')}>
      <div style={{ height: '100vh' }} className="bg-zinc-100 text-zinc-900 antialiased transition-colors dark:bg-zinc-950 dark:text-zinc-50">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 md:px-6 md:py-8">
          <header className="flex flex-col gap-3 border-b border-dashed border-zinc-200 pb-4 dark:border-zinc-800 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight md:text-2xl">
                <CalendarRange className="h-6 w-6" />
                {locale === 'zh' ? '日程日历' : 'Calendar scheduler'}
              </h1>
              <p className="mt-1 max-w-xl text-sm text-zinc-500 dark:text-zinc-400">
                {locale === 'zh'
                  ? '交互式 React 日历，支持月/周/日视图、内联创建、拖拽调整与明暗主题。'
                  : 'Interactive React calendar with month, week and day views, inline creation, drag & resize, and light/dark themes.'}
              </p>
            </div>
          </header>

          {/* Toggle Button (visible when config is closed) */}
          {!showConfig && (
            <div className="fixed top-24 right-4 z-50 animate-in slide-in-from-right-5 fade-in-0 duration-200">
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-full shadow-md bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                onClick={() => setShowConfig(true)}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Config Panel */}
          {showConfig && (
            <div className="fixed top-0 right-0 z-50 h-screen w-64 animate-in slide-in-from-right-5 fade-in-0 duration-200">
              <Card className="h-full w-full rounded-none border-l border-zinc-200 bg-white p-4 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center justify-between mb-4 pb-2 border-zinc-100 dark:border-zinc-800">
                  <h3 className="font-semibold text-sm">
                    {locale === 'zh' ? '配置' : 'Configuration'}
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 rounded-full"
                    onClick={() => setShowConfig(false)}
                  >
                    <span className="sr-only">Close</span>
                    ×
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs">{locale === 'zh' ? '主题' : 'Theme'}</Label>
                    <Select value={theme} onValueChange={(v) => setTheme(v as 'light' | 'dark')}>
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">{locale === 'zh' ? '语言' : 'Locale'}</Label>
                    <Select value={locale} onValueChange={(v) => setLocale(v as UiLocale)}>
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="zh">中文</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">{locale === 'zh' ? '周起始' : 'Week Start'}</Label>
                    <Select value={weekStart} onValueChange={(v) => setWeekStart(v as WeekStart)}>
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monday">Monday</SelectItem>
                        <SelectItem value="sunday">Sunday</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">{locale === 'zh' ? '默认视图' : 'Default View'}</Label>
                    <Select value={defaultView} onValueChange={(v) => setDefaultView(v as CalendarView)}>
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="month">Month</SelectItem>
                        <SelectItem value="week">Week</SelectItem>
                        <SelectItem value="day">Day</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <Label className="text-xs cursor-pointer" htmlFor="show-categories">
                      {locale === 'zh' ? '启用紧急程度' : 'Enable Urgency Levels'}
                    </Label>
                    <Switch
                      id="show-categories"
                      checked={showCategories}
                      onCheckedChange={setShowCategories}
                    />
                  </div>
                </div>
              </Card>
            </div>
          )}

          <Card className="h-full p-3 md:p-4 overflow-hidden flex flex-col">
            <div className="flex-1 min-h-0">
              <CalendarScheduler
                events={events}
                initialDate={new Date()}
                defaultView={defaultView}
                weekStart={weekStart}
                theme={theme}
                themeConfig={themeConfig}
                categories={showCategories ? demoCategories : []}
                locale={locale}
                onLocaleChange={setLocale}
                onThemeToggle={(next) => setTheme(next)}
                onEventCreate={(event) => setEvents((prev) => [...prev, event])}
                onEventUpdate={(updated) =>
                  setEvents((prev) =>
                    prev.map((evt) => (evt.id === updated.id ? updated : evt)),
                  )
                }
                onEventDelete={(id) =>
                  setEvents((prev) => prev.filter((evt) => evt.id !== id))
                }
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default App;
