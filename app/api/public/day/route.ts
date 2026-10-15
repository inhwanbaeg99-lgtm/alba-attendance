import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  if (!date) {
    return NextResponse.json({ error: "date가 필요합니다." }, { status: 400 });
  }

  const records = await prisma.attendanceRecord.findMany({
    where: { date },
    include: { employee: { select: { id: true, name: true, hourlyWage: true } } },
    orderBy: { clockIn: "asc" },
  });

  const workedEmployeeIds = records.map((r) => r.employeeId);

  const availableEmployees = await prisma.employee.findMany({
    where: { active: true, id: { notIn: workedEmployeeIds } },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return NextResponse.json({
    records: records.map((r) => ({
      id: r.id,
      employeeId: r.employeeId,
      employeeName: r.employee.name,
      clockIn: r.clockIn,
      clockOut: r.clockOut,
    })),
    availableEmployees,
  });
}
