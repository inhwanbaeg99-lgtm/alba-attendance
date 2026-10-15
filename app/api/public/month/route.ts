import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const year = Number(searchParams.get("year"));
  const month = Number(searchParams.get("month")); // 1-12

  if (!year || !month) {
    return NextResponse.json({ error: "year, month이 필요합니다." }, { status: 400 });
  }

  const from = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const to = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

  const records = await prisma.attendanceRecord.findMany({
    where: { date: { gte: from, lte: to } },
    include: { employee: { select: { name: true } } },
    orderBy: { clockIn: "asc" },
  });

  const counts: Record<string, number> = {};
  const days: Record<
    string,
    { employeeName: string; clockIn: string | null; clockOut: string | null }[]
  > = {};

  for (const r of records) {
    counts[r.date] = (counts[r.date] ?? 0) + 1;
    (days[r.date] ??= []).push({
      employeeName: r.employee.name,
      clockIn: r.clockIn ? r.clockIn.toISOString() : null,
      clockOut: r.clockOut ? r.clockOut.toISOString() : null,
    });
  }

  return NextResponse.json({ counts, days });
}
