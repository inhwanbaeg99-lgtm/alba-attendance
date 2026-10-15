"use client";

import { dateStringFor, todayDateString } from "@/lib/date";
import { holidayName } from "@/lib/holidays";

type DayEntry = { employeeName: string; clockIn: string | null; clockOut: string | null };

type Props = {
  year: number;
  month: number; // 1-12
  counts: Record<string, number>;
  days: Record<string, DayEntry[]>;
  selectedDate?: string | null;
  onSelectDate: (date: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
};

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];
const MAX_VISIBLE = 3;

export default function CalendarGrid({
  year,
  month,
  counts,
  days,
  selectedDate,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
}: Props) {
  const today = todayDateString();
  const firstDay = new Date(year, month - 1, 1);
  const startWeekday = firstDay.getDay();
  const daysInMonth = new Date(year, month, 0).getDate();

  const cells: (string | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(dateStringFor(new Date(year, month - 1, d)));
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between md:mb-6">
        <button
          type="button"
          onClick={onPrevMonth}
          aria-label="이전 달"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-bg text-ink md:h-11 md:w-11 md:text-lg"
        >
          ‹
        </button>
        <p className="text-base font-bold text-ink md:text-2xl">
          {year}년 {month}월
        </p>
        <button
          type="button"
          onClick={onNextMonth}
          aria-label="다음 달"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-bg text-ink md:h-11 md:w-11 md:text-lg"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-y-1 text-center md:gap-1">
        {WEEKDAYS.map((w) => (
          <div key={w} className="py-1 text-xs font-medium text-ink-sub md:text-base">
            {w}
          </div>
        ))}
        {cells.map((date, i) => {
          if (!date) return <div key={i} className="md:min-h-[7rem] lg:min-h-[8.5rem]" />;
          const day = Number(date.slice(-2));
          const isToday = date === today;
          const isSelected = date === selectedDate;
          const count = counts[date] ?? 0;
          const entries = days[date] ?? [];
          const isSunday = i % 7 === 0;
          const holiday = holidayName(date);
          const isRestDay = isSunday || Boolean(holiday);

          return (
            <button
              key={date}
              type="button"
              onClick={() => onSelectDate(date)}
              className={`flex flex-col items-center gap-0.5 rounded-lg py-1 transition md:min-h-[7rem] md:items-stretch md:gap-1 md:border md:p-2 md:text-left lg:min-h-[8.5rem] ${
                isSelected
                  ? "md:border-accent md:bg-accent-soft"
                  : "md:border-line/0 md:hover:border-line md:hover:bg-bg"
              }`}
            >
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-full text-lg font-semibold transition md:h-9 md:w-9 md:text-base lg:h-10 lg:w-10 lg:text-lg ${
                  isToday
                    ? "bg-accent text-white"
                    : isRestDay
                      ? "text-red-500"
                      : "text-ink"
                }`}
              >
                {day}
              </span>
              <span
                className={`h-1 w-1 rounded-full md:hidden ${count > 0 ? "bg-accent" : "bg-transparent"}`}
              />

              <div className="hidden w-full flex-col gap-0.5 md:flex">
                {holiday && (
                  <span className="truncate px-1 text-[11px] font-medium text-red-500 lg:text-xs">
                    {holiday}
                  </span>
                )}
                {entries.slice(0, MAX_VISIBLE).map((e, idx) => {
                  const working = Boolean(e.clockIn) && !e.clockOut;
                  return (
                    <span
                      key={idx}
                      className={`truncate rounded px-1 py-0.5 text-[11px] font-medium leading-tight lg:text-xs ${
                        working ? "bg-accent-soft text-accent" : "bg-bg text-ink-sub"
                      }`}
                    >
                      {e.employeeName}
                    </span>
                  );
                })}
                {entries.length > MAX_VISIBLE && (
                  <span className="px-1 text-[11px] font-semibold text-accent lg:text-xs">
                    +{entries.length - MAX_VISIBLE}명 더보기
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
