import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  const { id } = await params;
  const body = await req.json().catch(() => null);

  const data: {
    name?: string;
    phone?: string | null;
    hourlyWage?: number;
    active?: boolean;
  } = {};

  if (typeof body?.name === "string" && body.name.trim()) {
    data.name = body.name.trim();
  }
  if (typeof body?.phone === "string") {
    data.phone = body.phone.trim() || null;
  }
  if (body?.hourlyWage !== undefined) {
    const wage = Number(body.hourlyWage);
    if (Number.isFinite(wage)) data.hourlyWage = wage;
  }
  if (typeof body?.active === "boolean") {
    data.active = body.active;
  }

  const employee = await prisma.employee.update({
    where: { id },
    data,
    select: { id: true, name: true, phone: true, hourlyWage: true, active: true },
  });

  return NextResponse.json({ employee });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  const { id } = await params;
  await prisma.employee.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
