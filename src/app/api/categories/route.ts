import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { categories } from "@/db/schema";
import { DEFAULT_CATEGORIES } from "@/lib/categories";

export async function GET() {
  const { userId } = auth();
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const rows = await db
    .select({ name: categories.name })
    .from(categories)
    .where(eq(categories.userId, userId));

  const merged = new Set<string>(["Uncategorized", ...DEFAULT_CATEGORIES]);
  for (const row of rows) {
    merged.add(row.name);
  }

  return NextResponse.json(Array.from(merged));
}

export async function POST(request: Request) {
  const { userId } = auth();
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const body = (await request.json()) as { name?: string };
  const name = body.name?.trim() ?? "";
  if (!name) {
    return NextResponse.json({ id: null });
  }

  const existing = await db
    .select({ id: categories.id })
    .from(categories)
    .where(and(eq(categories.userId, userId), eq(categories.name, name)))
    .limit(1);

  if (existing.length > 0) {
    return NextResponse.json({ id: existing[0].id });
  }

  const inserted = await db
    .insert(categories)
    .values({ userId, name })
    .returning({ id: categories.id });

  return NextResponse.json({ id: inserted[0]?.id ?? null });
}

