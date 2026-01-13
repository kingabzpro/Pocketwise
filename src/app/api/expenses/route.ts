import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { and, desc, eq, gte, lte } from "drizzle-orm";
import { db } from "@/lib/db";
import { expenses } from "@/db/schema";

export async function GET(request: Request) {
  const { userId } = auth();
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const conditions = [eq(expenses.userId, userId)];
  if (category) {
    conditions.push(eq(expenses.category, category));
  }
  if (from) {
    conditions.push(gte(expenses.date, from));
  }
  if (to) {
    conditions.push(lte(expenses.date, to));
  }

  const rows = await db
    .select({
      id: expenses.id,
      amount: expenses.amount,
      description: expenses.description,
      category: expenses.category,
      date: expenses.date,
      aiSuggested: expenses.aiSuggested,
    })
    .from(expenses)
    .where(and(...conditions))
    .orderBy(desc(expenses.date), desc(expenses.createdAt));

  return NextResponse.json(
    rows.map((row) => ({
      ...row,
      amount: Number(row.amount),
    }))
  );
}

export async function POST(request: Request) {
  const { userId } = auth();
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const body = (await request.json()) as {
    amount?: number;
    description?: string;
    category?: string;
    date?: string;
    aiSuggested?: boolean;
  };

  const description = body.description?.trim() ?? "";
  const category = body.category?.trim() ?? "Uncategorized";
  const amount = Number(body.amount);
  const date = body.date ?? "";

  if (!description || Number.isNaN(amount) || !date) {
    return new NextResponse("Invalid payload", { status: 400 });
  }

  const inserted = await db
    .insert(expenses)
    .values({
      userId,
      amount,
      description,
      category,
      date,
      aiSuggested: body.aiSuggested,
    })
    .returning({ id: expenses.id });

  return NextResponse.json({ id: inserted[0]?.id ?? null });
}

