import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { hoursBetween } from "@/lib/date";

export async function GET(req: NextRequest) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from") || undefined;
  const to = searchParams.get("to") || undefined;
  const employeeId = searchParams.get("employeeId") || undefined;

  const records = await prisma.attendanceRecord.findMany({
    where: {
      ...(employeeId ? { employeeId } : {}),
      ...(from || to
        ? {
            date: {
              ...(from ? { gte: from } : {}),
              ...(to ? { lte: to } : {}),
            },
          }
        : {}),
    },
    include: {
      employee: { select: { id: true, name: true, hourlyWage: true } },
    },
    orderBy: [{ date: "desc" }, { createdAt: "asc" }],
  });

  const result = records.map((r) => {
    const hours = hoursBetween(r.clockIn, r.clockOut);
    return {
      id: r.id,
      date: r.date,
      employeeId: r.employeeId,
      employeeName: r.employee.name,
      hourlyWage: r.employee.hourlyWage,
      clockIn: r.clockIn,
      clockOut: r.clockOut,
      hours,
      pay: Math.round(hours * r.employee.hourlyWage),
    };
  });

  return NextResponse.json({ records: result });
}
