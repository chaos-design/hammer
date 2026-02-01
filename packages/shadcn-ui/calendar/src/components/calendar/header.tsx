'use client';
import type { Locale as DateFnsLocale } from 'date-fns';
import { addDays, startOfDay, startOfMonth } from 'date-fns';
import {
  CalendarRange,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LocateFixed,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Calendar } from '../../components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../components/ui/popover';
import type {
  CalendarStrings,
  CalendarView,
  UiLocale,
  WeekStart,
} from '../../types';
import { cn } from '../../utils';
import { formatHeaderLabel } from '../../utils/calendar-logic';
import { MonthDatepicker } from './month-datepicker';

interface CalendarHeaderProps {
  currentView: CalendarView;
  setCurrentView: (view: CalendarView) => void;
  focusDate: Date;
  setFocusDate: (date: Date) => void;
  locale: UiLocale;
  dateFnsLocale: DateFnsLocale;
  weekStart: WeekStart;
  strings: CalendarStrings;
  accentRingClass: string;
  hasEvents: boolean;
  monthPopoverOpen: boolean;
  setMonthPopoverOpen: (open: boolean) => void;
  onNewEventClick: () => void;
  monthLabel: string;
}

export function CalendarHeader(props: CalendarHeaderProps) {
  const {
    currentView,
    setCurrentView,
    focusDate,
    setFocusDate,
    locale,
    dateFnsLocale,
    weekStart,
    strings,
    accentRingClass,
    hasEvents,
    monthPopoverOpen,
    setMonthPopoverOpen,
    onNewEventClick,
    monthLabel,
  } = props;

  const headerLabel = formatHeaderLabel(
    focusDate,
    currentView,
    locale,
    dateFnsLocale,
    weekStart,
  );

  const handlePrev = () => {
    if (currentView === 'month') {
      setFocusDate(addDays(focusDate, -30));
    } else if (currentView === 'week') {
      setFocusDate(addDays(focusDate, -7));
    } else {
      setFocusDate(addDays(focusDate, -1));
    }
  };

  const handleNext = () => {
    if (currentView === 'month') {
      setFocusDate(addDays(focusDate, 30));
    } else if (currentView === 'week') {
      setFocusDate(addDays(focusDate, 7));
    } else {
      setFocusDate(addDays(focusDate, 1));
    }
  };

  const handleToday = () => {
    setFocusDate(new Date());
  };

  return (
    <>
      <div className="flex flex-col gap-3 border-b border-zinc-200 pb-3 dark:border-zinc-800 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center rounded-full bg-zinc-900 p-2 text-zinc-50 shadow-sm dark:bg-zinc-50 dark:text-zinc-900">
              <CalendarRange className="h-5 w-5" />
            </div>
            <div>
              {/* <div className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">
                {strings.scheduleLabel}
              </div> */}
              <div className="flex items-baseline gap-2">
                {currentView === 'month' ? (
                  <Popover
                    open={monthPopoverOpen}
                    onOpenChange={setMonthPopoverOpen}
                  >
                    <PopoverTrigger asChild>
                      <h2 className="flex cursor-pointer items-center gap-1 text-lg font-semibold">
                        {monthLabel}
                        <ChevronDown className="h-4 w-4 text-zinc-400" />
                      </h2>
                    </PopoverTrigger>
                    <PopoverContent
                      className="p-0 w-auto"
                      align="start"
                      sideOffset={8}
                      onOpenAutoFocus={(e) => e.preventDefault()}
                    >
                      <MonthDatepicker
                        currentDate={focusDate}
                        onMonthSelect={(date: Date) => {
                          setFocusDate(date);
                          setMonthPopoverOpen(false);
                        }}
                        locale={dateFnsLocale}
                      />
                      <div className="flex items-center justify-between p-3 pt-0">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          className="h-7 px-2 text-[11px] rounded-full"
                          onClick={() => {
                            const today = startOfDay(new Date());
                            setFocusDate(startOfMonth(today));
                            setMonthPopoverOpen(false);
                          }}
                        >
                          <LocateFixed className="h-2 w-2" />
                          {strings.currentMonthLabel}
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                ) : (
                  <Popover
                    open={monthPopoverOpen}
                    onOpenChange={setMonthPopoverOpen}
                  >
                    <PopoverTrigger asChild>
                      <h2 className="flex cursor-pointer items-center gap-1 text-lg font-semibold">
                        {headerLabel}
                        <ChevronDown className="h-4 w-4 text-zinc-400" />
                      </h2>
                    </PopoverTrigger>
                    <PopoverContent
                      className="p-3 w-auto"
                      align="start"
                      sideOffset={8}
                    >
                      <Calendar
                        mode="single"
                        selected={focusDate}
                        onSelect={(date) => {
                          if (date) {
                            setFocusDate(date);
                            setMonthPopoverOpen(false);
                          }
                        }}
                        initialFocus
                        locale={dateFnsLocale}
                      />
                    </PopoverContent>
                  </Popover>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1">
            <div className="flex items-center gap-1 rounded-full bg-zinc-100 p-1 text-xs dark:bg-zinc-900">
              <Button
                type="button"
                variant={currentView === 'month' ? 'default' : 'ghost'}
                size="sm"
                className={cn(
                  'h-7 px-3 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800',
                  'cursor-pointer',
                  currentView === 'month' &&
                    'bg-white text-zinc-900 shadow-sm hover:bg-white dark:bg-zinc-800 dark:text-zinc-50',
                  currentView === 'month' && accentRingClass,
                )}
                onClick={() => setCurrentView('month')}
              >
                {strings.monthLabel}
              </Button>
              <Button
                type="button"
                variant={currentView === 'week' ? 'default' : 'ghost'}
                size="sm"
                className={cn(
                  'h-7 px-3 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800',
                  'cursor-pointer',
                  currentView === 'week' &&
                    'bg-white text-zinc-900 shadow-sm hover:bg-white dark:bg-zinc-800 dark:text-zinc-50',
                  currentView === 'week' && accentRingClass,
                )}
                onClick={() => setCurrentView('week')}
              >
                {strings.weekLabel}
              </Button>
              <Button
                type="button"
                variant={currentView === 'day' ? 'default' : 'ghost'}
                size="sm"
                className={cn(
                  'h-7 px-3 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800',
                  'cursor-pointer',
                  currentView === 'day' &&
                    'bg-white text-zinc-900 shadow-sm hover:bg-white dark:bg-zinc-800 dark:text-zinc-50',
                  currentView === 'day' && accentRingClass,
                )}
                onClick={() => setCurrentView('day')}
              >
                {strings.dayLabel}
              </Button>
            </div>

            <div className="flex items-center gap-1 rounded-full bg-zinc-100 p-1 text-xs dark:bg-zinc-900">
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-7 w-7 cursor-pointer rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800"
                onClick={handlePrev}
                aria-label="Previous period"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-7 w-7 cursor-pointer rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800"
                onClick={handleNext}
                aria-label="Next period"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 px-2 cursor-pointer text-xs rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800"
                onClick={handleToday}
              >
                {strings.todayLabel}
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1">
          <Button
            type="button"
            size="sm"
            className="h-7 px-3 cursor-pointer text-xs rounded-full"
            onClick={onNewEventClick}
          >
            {strings.newEventLabel}
          </Button>
        </div>
      </div>

      {!hasEvents && (
        <div className="rounded-md border border-dashed border-zinc-300 bg-zinc-50 px-3 py-2 text-xs text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-400">
          {strings.noEventsMessage}
        </div>
      )}
    </>
  );
}
