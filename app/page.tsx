"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { todayDateString } from "@/lib/date";
import CalendarGrid from "@/components/CalendarGrid";
import AdminUnlock from "@/components/AdminUnlock";
import DayPanel from "@/components/DayPanel";

type DayEntry = { employeeName: string; clockIn: string | null; clockOut: string | null };

export default function Home() {
  const router = useRouter();
  // 오늘 날짜는 프리렌더(빌드 시점)가 아닌 마운트 후에 계산한다.
  const [year, setYear] = useState<number | null>(null);
  const [month, setMonth] = useState(1);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [days, setDays] = useState<Record<string, DayEntry[]>>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  async function loadMonth(y: number, m: number) {
    const res = await fetch(`/api/public/month?year=${y}&month=${m}`);
    const data = await res.json();
    setCounts(data.counts ?? {});
    setDays(data.days ?? {});
  }

  useEffect(() => {
    const today = todayDateString();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setYear(Number(today.slice(0, 4)));
    setMonth(Number(today.slice(5, 7)));
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (year !== null) loadMonth(year, month);
  }, [year, month]);

  if (year === null) return null;

  function changeMonth(delta: number) {
    if (year === null) return;
    let newYear = year;
    let newMonth = month + delta;
    if (newMonth < 1) {
      newMonth = 12;
      newYear -= 1;
    } else if (newMonth > 12) {
      newMonth = 1;
      newYear += 1;
    }
    setYear(newYear);
    setMonth(newMonth);
  }

  function handleSelectDate(date: string) {
    if (typeof window !== "undefined" && window.matchMedia("(min-width: 768px)").matches) {
      setSelectedDate(date);
    } else {
      router.push(`/day/${date}`);
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <div className="flex w-full max-w-sm flex-col md:w-auto md:max-w-none">
        <AdminUnlock title="MGC · 춘천온의파크점" />

        <div className="flex items-stretch overflow-hidden rounded-2xl bg-paper transition-all duration-300">
          <div
            className={`w-full p-4 md:w-[640px] md:p-8 lg:w-[760px] ${
              selectedDate ? "md:rounded-r-none" : ""
            }`}
          >
            <CalendarGrid
              year={year}
              month={month}
              counts={counts}
              days={days}
              selectedDate={selectedDate}
              onSelectDate={handleSelectDate}
              onPrevMonth={() => changeMonth(-1)}
              onNextMonth={() => changeMonth(1)}
            />
          </div>

          {selectedDate && (
            <div className="hidden shrink-0 border-l border-line p-5 md:flex md:w-[300px] md:flex-col">
              <DayPanel
                date={selectedDate}
                onClose={() => setSelectedDate(null)}
                onRecordsChange={() => loadMonth(year, month)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
