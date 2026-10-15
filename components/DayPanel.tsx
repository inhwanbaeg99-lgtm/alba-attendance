"use client";

import { useEffect, useState } from "react";
import { formatDateHeading, formatTime, hoursBetween, todayDateString } from "@/lib/date";

type DayRecord = {
  id: string;
  employeeId: string;
  employeeName: string;
  clockIn: string | null;
  clockOut: string | null;
};

type AvailableEmployee = { id: string; name: string };

export default function DayPanel({
  date,
  onClose,
  onRecordsChange,
}: {
  date: string;
  onClose?: () => void;
  onRecordsChange?: () => void;
}) {
  const today = todayDateString();
  const isToday = date === today;

  const [records, setRecords] = useState<DayRecord[]>([]);
  const [availableEmployees, setAvailableEmployees] = useState<AvailableEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [detail, setDetail] = useState<DayRecord | null>(null);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/public/day?date=${date}`);
    const data = await res.json();
    setRecords(data.records ?? []);
    setAvailableEmployees(data.availableEmployees ?? []);
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  async function handleClockIn(employeeId: string) {
    setError("");
    const res = await fetch("/api/public/clock-in", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ employeeId }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "출근 처리에 실패했습니다.");
      return;
    }
    setPickerOpen(false);
    await load();
    onRecordsChange?.();
  }

  async function handleClockOut(employeeId: string) {
    setError("");
    const res = await fetch("/api/public/clock-out", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ employeeId }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "퇴근 처리에 실패했습니다.");
      return;
    }
    setDetail(null);
    await load();
    onRecordsChange?.();
  }

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex items-start justify-between gap-2">
        <div>
          <p className="text-base font-extrabold text-ink">{formatDateHeading(date)}</p>
          {!loading && <p className="text-xs text-ink-sub">{records.length}명 근무</p>}
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-bg text-ink-sub"
          >
            ×
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto rounded-xl bg-bg">
        {records.map((r) => {
          const working = Boolean(r.clockIn) && !r.clockOut;
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => setDetail(r)}
              className="flex w-full items-center justify-between border-b border-line px-3 py-2.5 text-left last:border-none"
            >
              <div>
                <p className="text-sm font-bold text-ink">{r.employeeName}</p>
                <p className="text-xs text-ink-sub">
                  {formatTime(r.clockIn ? new Date(r.clockIn) : null)} ~{" "}
                  {formatTime(r.clockOut ? new Date(r.clockOut) : null)}
                </p>
              </div>
              <span
                className={`rounded-full px-2 py-1 text-[11px] font-semibold ${
                  working ? "bg-accent-soft text-accent" : "text-ink-sub"
                }`}
              >
                {working ? "근무중" : "퇴근"}
              </span>
            </button>
          );
        })}
        {!loading && records.length === 0 && (
          <div className="px-3 py-8 text-center text-sm text-ink-sub">근무 기록이 없습니다.</div>
        )}
      </div>

      {isToday && (
        <button
          type="button"
          onClick={() => {
            setError("");
            setPickerOpen(true);
          }}
          className="mt-3 flex w-full items-center justify-center gap-1 rounded-full bg-accent py-2.5 text-sm font-bold text-white"
        >
          + 출근 추가
        </button>
      )}

      {pickerOpen && (
        <div
          className="fixed inset-0 z-20 flex items-end justify-center bg-black/30 md:items-center"
          onClick={() => setPickerOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-t-2xl bg-bg p-5 pb-8 md:rounded-2xl md:pb-5"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="mb-3 text-base font-bold text-ink">출근할 직원 선택</p>
            {error && (
              <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
            )}
            <div className="flex flex-col gap-2">
              {availableEmployees.map((e) => (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => handleClockIn(e.id)}
                  className="rounded-xl bg-paper px-4 py-3 text-left text-base font-semibold text-ink"
                >
                  {e.name}
                </button>
              ))}
              {availableEmployees.length === 0 && (
                <p className="py-4 text-center text-sm text-ink-sub">
                  출근 가능한 직원이 없습니다.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {detail && (
        <div
          className="fixed inset-0 z-20 flex items-end justify-center bg-black/30 md:items-center"
          onClick={() => setDetail(null)}
        >
          <div
            className="w-full max-w-sm rounded-t-2xl bg-bg p-5 pb-8 md:rounded-2xl md:pb-5"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="mb-4 text-base font-bold text-ink">{detail.employeeName}</p>
            <div className="mb-4 rounded-xl bg-paper p-4 text-sm">
              <div className="flex justify-between py-1">
                <span className="text-ink-sub">출근</span>
                <span className="font-semibold text-ink">
                  {formatTime(detail.clockIn ? new Date(detail.clockIn) : null)}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-ink-sub">퇴근</span>
                <span className="font-semibold text-ink">
                  {formatTime(detail.clockOut ? new Date(detail.clockOut) : null)}
                </span>
              </div>
              {detail.clockOut && (
                <div className="mt-2 flex justify-between border-t border-line pt-2">
                  <span className="text-ink-sub">근무 시간</span>
                  <span className="font-semibold text-ink">
                    {hoursBetween(new Date(detail.clockIn!), new Date(detail.clockOut)).toFixed(1)}
                    시간
                  </span>
                </div>
              )}
            </div>
            {error && (
              <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
            )}
            {isToday && !detail.clockOut ? (
              <button
                type="button"
                onClick={() => handleClockOut(detail.employeeId)}
                className="w-full rounded-full bg-accent py-3 text-sm font-bold text-white"
              >
                퇴근하기
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setDetail(null)}
                className="w-full rounded-full bg-paper py-3 text-sm font-bold text-ink"
              >
                닫기
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
