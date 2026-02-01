import * as React from "react";
import "./index.css";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, setMonth, setYear, startOfMonth } from "date-fns";
import type { Locale } from "date-fns";
import { Button } from "./components/ui/button";
import { cn } from "@chaos-design/shadcn-kits";

interface MonthDatepickerProps {
  className?: string;
  currentDate: Date;
  onMonthSelect: (date: Date) => void;
  locale: Locale;
}

export function MonthDatepicker({
  className,
  currentDate,
  onMonthSelect,
  locale,
}: MonthDatepickerProps) {
  const [viewYear, setViewYear] = React.useState(currentDate.getFullYear());
  const [mode, setMode] = React.useState<"month" | "year">("month");

  // Reset view year when currentDate changes (optional, but good for sync)
  React.useEffect(() => {
    setViewYear(currentDate.getFullYear());
  }, [currentDate]);

  const handlePrevYear = () => {
    if (mode === "month") {
      setViewYear((prev) => prev - 1);
    } else {
      setViewYear((prev) => prev - 10);
    }
  };

  const handleNextYear = () => {
    if (mode === "month") {
      setViewYear((prev) => prev + 1);
    } else {
      setViewYear((prev) => prev + 10);
    }
  };

  const handleMonthClick = (monthIndex: number) => {
    const newDate = setMonth(setYear(startOfMonth(currentDate), viewYear), monthIndex);
    onMonthSelect(newDate);
  };

  const handleYearClick = (year: number) => {
    setViewYear(year);
    setMode("month");
  };

  const months = Array.from({ length: 12 }, (_, i) => {
    // Create a date for each month of the view year to format its name
    const date = new Date(viewYear, i, 1);
    return {
      index: i,
      name: format(date, "MMM", { locale }), // Short month name (e.g., Jan, Feb)
      fullName: format(date, "MMMM", { locale }), // Full month name for aria-label
    };
  });

  const startYear = Math.floor(viewYear / 10) * 10;
  const years = Array.from({ length: 12 }, (_, i) => {
    const year = startYear - 1 + i;
    return {
      year,
      isCurrentDecade: year >= startYear && year <= startYear + 9,
    };
  });

  return (
    <div className={cn("w-[280px] p-3", className)}>
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 bg-transparent p-0 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
          onClick={handlePrevYear}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div
          className={cn(
            "text-sm font-medium cursor-pointer px-2 py-1 rounded",
            "hover:bg-zinc-100 dark:hover:bg-zinc-800",
            mode === "year" && "font-bold"
          )}
          onClick={() => setMode(mode === "month" ? "year" : "month")}
        >
          {mode === "month" ? viewYear : `${startYear}-${startYear + 9}`}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
          onClick={handleNextYear}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {mode === "month" ? (
        <div className="grid grid-cols-3 gap-2">
          {months.map((month) => {
            const isSelected =
              currentDate.getMonth() === month.index &&
              currentDate.getFullYear() === viewYear;
            const isCurrentMonth =
              new Date().getMonth() === month.index &&
              new Date().getFullYear() === viewYear;

            return (
              <Button
                key={month.index}
                variant={isSelected ? "default" : "ghost"}
                className={cn(
                  "h-9 text-sm font-normal",
                  // isSelected && "hover:bg-primary hover:text-primary-foreground",
                  !isSelected && isCurrentMonth && "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
                )}
                onClick={() => handleMonthClick(month.index)}
                aria-label={month.fullName}
              >
                {month.name}
              </Button>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2 px-3">
          {years.map((item) => {
            const isSelected = currentDate.getFullYear() === item.year;
            const isCurrentYear = new Date().getFullYear() === item.year;

            return (
              <Button
                key={item.year}
                variant={isSelected ? "default" : "ghost"}
                className={cn(
                  "h-9 text-sm font-normal",
                  !item.isCurrentDecade && "text-zinc-400 dark:text-zinc-500",
                  // isSelected && "hover:bg-primary hover:text-primary-foreground",
                  !isSelected && isCurrentYear && "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
                )}
                onClick={() => handleYearClick(item.year)}
              >
                {item.year}
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );
}
