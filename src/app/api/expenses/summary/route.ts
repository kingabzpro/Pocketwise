import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { expenses } from "@/db/schema";

export async function GET(request: Request) {
  const { userId } = auth();
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const conditions = [eq(expenses.userId, userId)];
  if (from) {
    conditions.push(gte(expenses.date, from));
  }
  if (to) {
    conditions.push(lte(expenses.date, to));
  }

  const totalRow = await db
    .select({ total: sql<number>`sum(${expenses.amount})` })
    .from(expenses)
    .where(and(...conditions));

  const byCategory = await db
    .select({
      category: expenses.category,
      amount: sql<number>`sum(${expenses.amount})`,
    })
    .from(expenses)
    .where(and(...conditions))
    .groupBy(expenses.category)
    .orderBy(desc(sql`sum(${expenses.amount})`));

  return NextResponse.json({
    total: Number(totalRow[0]?.total ?? 0),
    byCategory: byCategory.map((row) => ({
      category: row.category,
      amount: Number(row.amount),
    })),
  });
}

