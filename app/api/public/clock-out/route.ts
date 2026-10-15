import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { todayDateString } from "@/lib/date";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const employeeId = typeof body?.employeeId === "string" ? body.employeeId : "";
  if (!employeeId) {
    return NextResponse.json({ error: "직원을 선택해주세요." }, { status: 400 });
  }

  const date = todayDateString();
  const existing = await prisma.attendanceRecord.findUnique({
    where: { employeeId_date: { employeeId, date } },
  });
  if (!existing?.clockIn) {
    return NextResponse.json({ error: "출근 기록이 없습니다." }, { status: 409 });
  }
  if (existing.clockOut) {
    return NextResponse.json({ error: "이미 퇴근 처리되었습니다." }, { status: 409 });
  }

  const record = await prisma.attendanceRecord.update({
    where: { employeeId_date: { employeeId, date } },
    data: { clockOut: new Date() },
  });

  return NextResponse.json({ record });
}
