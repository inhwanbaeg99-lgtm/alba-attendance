import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { todayDateString } from "@/lib/date";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const employeeId = typeof body?.employeeId === "string" ? body.employeeId : "";
  if (!employeeId) {
    return NextResponse.json({ error: "직원을 선택해주세요." }, { status: 400 });
  }

  const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
  if (!employee || !employee.active) {
    return NextResponse.json({ error: "직원을 찾을 수 없습니다." }, { status: 404 });
  }

  const date = todayDateString();
  const existing = await prisma.attendanceRecord.findUnique({
    where: { employeeId_date: { employeeId, date } },
  });
  if (existing?.clockIn) {
    return NextResponse.json({ error: "이미 출근 처리되었습니다." }, { status: 409 });
  }

  const record = await prisma.attendanceRecord.upsert({
    where: { employeeId_date: { employeeId, date } },
    update: { clockIn: new Date() },
    create: { employeeId, date, clockIn: new Date() },
  });

  return NextResponse.json({ record });
}
