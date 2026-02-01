"use client";

import { MonthDatepicker } from "@chaos-design/month-datepicker";
import { useState } from "react";
import { format } from "date-fns";
import { enUS, zhCN } from "date-fns/locale";

export function MonthDatepickerDemo() {
  const [enDate, setEnDate] = useState<Date>(new Date());
  const [zhDate, setZhDate] = useState<Date>(new Date());

  return (
    <div className="flex flex-col items-center justify-center p-4 gap-6">
      <div className="grid w-full max-w-3xl gap-6 md:grid-cols-2">
        <div className="flex flex-col items-center gap-3">
          <div className="text-sm font-medium">
            English: {format(enDate, "MMMM yyyy", { locale: enUS })}
          </div>
          <div className="border rounded-md p-2">
            <MonthDatepicker
              currentDate={enDate}
              onMonthSelect={setEnDate}
              locale={enUS}
            />
          </div>
        </div>
        <div className="flex flex-col items-center gap-3">
          <div className="text-sm font-medium">
            中文: {format(zhDate, "yyyy年MM月", { locale: zhCN })}
          </div>
          <div className="border rounded-md p-2">
            <MonthDatepicker
              currentDate={zhDate}
              onMonthSelect={setZhDate}
              locale={zhCN}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default MonthDatepickerDemo;
