import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const bodySchema = z.object({
  type: z.enum(["page_view", "click", "conversion", "custom"]),
  name: z.string().min(1).max(120),
  path: z.string().max(500).optional(),
  locale: z.string().max(12).optional(),
  visitorKey: z.string().max(80).optional(),
  payload: z.any().optional(),
});

const hits = new Map<string, number[]>();
const WINDOW = 60_000;
const MAX_PER_MIN = 120;

function allow(ip: string): boolean {
  const now = Date.now();
  const arr = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW);
  if (arr.length >= MAX_PER_MIN) {
    hits.set(ip, arr);
    return false;
  }
  arr.push(now);
  hits.set(ip, arr);
  return true;
}

export async function POST(req: Request) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip")?.trim() ||
      "unknown";
    if (!allow(ip)) {
      return NextResponse.json({ ok: false }, { status: 429 });
    }

    const json = (await req.json()) as unknown;
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const d = parsed.data;
    await prisma.analyticsEvent.create({
      data: {
        type: d.type,
        name: d.name,
        path: d.path,
        locale: d.locale,
        visitorKey: d.visitorKey,
        payload: d.payload as object | undefined,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[analytics/collect]", e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
