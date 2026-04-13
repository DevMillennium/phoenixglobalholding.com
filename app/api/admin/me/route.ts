import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-session";

export async function GET() {
  const ctx = await getAdminSession();
  if (!ctx) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  return NextResponse.json({
    ok: true,
    user: {
      id: ctx.user.id,
      email: ctx.user.email,
      name: ctx.user.name,
      role: ctx.user.role,
    },
  });
}
