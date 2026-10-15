"use client";

import { useEffect, useMemo, useState } from "react";
import { dateStringFor, todayDateString } from "@/lib/date";

type Employee = { id: string; name: string };
type Record = {
  id: string;
  date: string;
  employeeId: string;
  employeeName: string;
  hourlyWage: number;
  clockIn: string | null;
  clockOut: string | null;
  hours: number;
  pay: number;
};

function formatTime(iso: string | null) {
  if (!iso) return "-";
  return new Date(iso).toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Seoul",
  });
}

// 최근 7일 (KST 기준). new Date()는 프리렌더 중에 호출되면 안 되므로 마운트 후에 계산한다.
function defaultRange() {
  const weekAgo = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000);
  return { from: dateStringFor(weekAgo), to: todayDateString() };
}

export default function RecordsPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [records, setRecords] = useState<Record[]>([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/employees")
      .then((r) => r.json())
      .then((d) => setEmployees(d.employees ?? []));
  }, []);

  async function load(range = { from, to }) {
    setLoading(true);
    const params = new URLSearchParams(range);
    if (employeeId) params.set("employeeId", employeeId);
    const res = await fetch(`/api/admin/records?${params.toString()}`);
    const data = await res.json();
    setRecords(data.records ?? []);
    setLoading(false);
  }

  useEffect(() => {
    const range = defaultRange();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFrom(range.from);
    setTo(range.to);
    load(range);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totals = useMemo(() => {
    const hours = records.reduce((sum, r) => sum + r.hours, 0);
    const pay = records.reduce((sum, r) => sum + r.pay, 0);
    return { hours, pay };
  }, [records]);

  function exportCsv() {
    const header = ["날짜", "이름", "출근", "퇴근", "근무시간", "급여"];
    const rows = records.map((r) => [
      r.date,
      r.employeeName,
      formatTime(r.clockIn),
      formatTime(r.clockOut),
      r.hours.toFixed(2),
      String(r.pay),
    ]);
    const csv = [header, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance_${from}_${to}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <h2 className="mb-6 text-xl font-bold text-ink">근무 기록</h2>

      <div className="mb-6 flex flex-wrap items-end gap-3 rounded-2xl bg-paper p-5">
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-sub">시작일</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="rounded-lg bg-bg px-3 py-2 text-sm text-ink outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-sub">종료일</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="rounded-lg bg-bg px-3 py-2 text-sm text-ink outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-sub">직원</label>
          <select
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            className="rounded-lg bg-bg px-3 py-2 text-sm text-ink outline-none"
          >
            <option value="">전체</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={() => load()}
          className="rounded-full bg-accent px-4 py-2 text-sm font-bold text-white"
        >
          조회
        </button>
        <button
          onClick={exportCsv}
          disabled={records.length === 0}
          className="rounded-full bg-bg px-4 py-2 text-sm font-bold text-ink disabled:opacity-50"
        >
          CSV 내보내기
        </button>
        <p className="ml-auto text-sm text-ink-sub">
          합계 <span className="font-semibold text-ink">{totals.hours.toFixed(1)}시간</span>{" "}
          · <span className="font-semibold text-ink">{totals.pay.toLocaleString()}원</span>
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl bg-paper">
        <table className="w-full text-sm">
          <thead className="text-left text-ink-sub">
            <tr>
              <th className="px-4 py-3 font-medium">날짜</th>
              <th className="px-4 py-3 font-medium">이름</th>
              <th className="px-4 py-3 font-medium">출근</th>
              <th className="px-4 py-3 font-medium">퇴근</th>
              <th className="px-4 py-3 font-medium">근무시간</th>
              <th className="px-4 py-3 font-medium">급여</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r.id} className="border-t border-line">
                <td className="px-4 py-3">{r.date}</td>
                <td className="px-4 py-3 font-medium text-ink">{r.employeeName}</td>
                <td className="px-4 py-3">{formatTime(r.clockIn)}</td>
                <td className="px-4 py-3">{formatTime(r.clockOut)}</td>
                <td className="px-4 py-3">{r.hours.toFixed(1)}시간</td>
                <td className="px-4 py-3">{r.pay.toLocaleString()}원</td>
              </tr>
            ))}
            {!loading && records.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-ink-sub">
                  조회된 기록이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
