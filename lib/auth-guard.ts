import { NextResponse } from "next/server";
import { getSession, type SessionPayload } from "@/lib/session";

export async function requireAdmin(): Promise<
  { session: SessionPayload } | { error: NextResponse }
> {
  const session = await getSession();
  if (!session) {
    return { error: NextResponse.json({ error: "관리자 인증이 필요합니다." }, { status: 401 }) };
  }
  return { session };
}
