import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSessionCookie, clearSessionCookie } from "@/lib/session";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const pin = typeof body?.pin === "string" ? body.pin.trim() : "";

  if (!pin) {
    return NextResponse.json({ error: "PIN을 입력해주세요." }, { status: 400 });
  }

  const admins = await prisma.admin.findMany();
  for (const admin of admins) {
    if (await bcrypt.compare(pin, admin.pinHash)) {
      await createSessionCookie({ aid: admin.id, name: admin.name });
      return NextResponse.json({ ok: true });
    }
  }

  return NextResponse.json({ error: "PIN이 올바르지 않습니다." }, { status: 401 });
}

export async function DELETE() {
  await clearSessionCookie();
  return NextResponse.json({ ok: true });
}
