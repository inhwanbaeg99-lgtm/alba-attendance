"use client";

import { useEffect, useState } from "react";

type Employee = {
  id: string;
  name: string;
  phone: string | null;
  hourlyWage: number;
  active: boolean;
};

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [hourlyWage, setHourlyWage] = useState("10030");
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/employees");
    const data = await res.json();
    setEmployees(data.employees ?? []);
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, hourlyWage: Number(hourlyWage) }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "추가에 실패했습니다.");
        return;
      }
      setName("");
      setPhone("");
      await load();
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleActive(emp: Employee) {
    await fetch(`/api/admin/employees/${emp.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !emp.active }),
    });
    await load();
  }

  async function updateWage(emp: Employee, value: string) {
    const wage = Number(value);
    if (!Number.isFinite(wage)) return;
    await fetch(`/api/admin/employees/${emp.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hourlyWage: wage }),
    });
    await load();
  }

  async function remove(emp: Employee) {
    if (!window.confirm(`${emp.name}님을 삭제하시겠습니까? 근무 기록도 함께 삭제됩니다.`)) {
      return;
    }
    await fetch(`/api/admin/employees/${emp.id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div>
      <h2 className="mb-6 text-xl font-bold text-ink">직원 관리</h2>

      <form
        onSubmit={handleAdd}
        className="mb-8 flex flex-wrap items-end gap-3 rounded-2xl bg-paper p-5"
      >
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-sub">이름</label>
          <input
            className="w-28 rounded-lg bg-bg px-3 py-2 text-sm text-ink outline-none"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-sub">
            전화번호 (선택)
          </label>
          <input
            className="w-36 rounded-lg bg-bg px-3 py-2 text-sm text-ink outline-none"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="01012345678"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-sub">시급(원)</label>
          <input
            className="w-28 rounded-lg bg-bg px-3 py-2 text-sm text-ink outline-none"
            type="number"
            value={hourlyWage}
            onChange={(e) => setHourlyWage(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-accent px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
        >
          추가
        </button>
        {error && <p className="w-full text-sm text-red-600">{error}</p>}
      </form>

      <div className="overflow-hidden rounded-2xl bg-paper">
        <table className="w-full text-sm">
          <thead className="text-left text-ink-sub">
            <tr>
              <th className="px-4 py-3 font-medium">이름</th>
              <th className="px-4 py-3 font-medium">전화번호</th>
              <th className="px-4 py-3 font-medium">시급</th>
              <th className="px-4 py-3 font-medium">상태</th>
              <th className="px-4 py-3 font-medium">관리</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp.id} className="border-t border-line">
                <td className="px-4 py-3 font-medium text-ink">{emp.name}</td>
                <td className="px-4 py-3 text-ink-sub">{emp.phone ?? "-"}</td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    defaultValue={emp.hourlyWage}
                    onBlur={(e) => updateWage(emp, e.target.value)}
                    className="w-24 rounded-lg bg-bg px-2 py-1 text-sm text-ink outline-none"
                  />
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleActive(emp)}
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      emp.active ? "bg-accent-soft text-accent" : "bg-bg text-ink-sub"
                    }`}
                  >
                    {emp.active ? "재직중" : "비활성"}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => remove(emp)}
                    className="text-xs font-medium text-red-500 hover:text-red-700"
                  >
                    삭제
                  </button>
                </td>
              </tr>
            ))}
            {!loading && employees.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-ink-sub">
                  등록된 직원이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
