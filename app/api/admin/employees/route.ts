import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";

export async function GET() {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  const employees = await prisma.employee.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      phone: true,
      hourlyWage: true,
      active: true,
      createdAt: true,
    },
  });
  return NextResponse.json({ employees });
}

export async function POST(req: NextRequest) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  const body = await req.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const phone = typeof body?.phone === "string" ? body.phone.trim() : "";
  const hourlyWage = Number(body?.hourlyWage ?? 0);

  if (!name) {
    return NextResponse.json({ error: "이름을 입력해주세요." }, { status: 400 });
  }

  const employee = await prisma.employee.create({
    data: {
      name,
      phone: phone || null,
      hourlyWage: Number.isFinite(hourlyWage) ? hourlyWage : 0,
    },
    select: { id: true, name: true, phone: true, hourlyWage: true, active: true },
  });

  return NextResponse.json({ employee }, { status: 201 });
}
