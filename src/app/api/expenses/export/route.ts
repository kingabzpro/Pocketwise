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
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const conditions = [eq(expenses.userId, userId)];
  if (from) {
    conditions.push(gte(expenses.date, from));
  }
  if (to) {
    conditions.push(lte(expenses.date, to));
  }

  const rows = await db
    .select({
      amount: expenses.amount,
      description: expenses.description,
      category: expenses.category,
      date: expenses.date,
    })
    .from(expenses)
    .where(and(...conditions))
    .orderBy(desc(expenses.date), desc(expenses.createdAt));

  const header = "date,description,category,amount";
  const lines = rows.map((expense) => {
    const description = expense.description.replaceAll('"', '""');
    const category = expense.category.replaceAll('"', '""');
    return `${expense.date},"${description}","${category}",${Number(
      expense.amount
    )}`;
  });

  return new NextResponse([header, ...lines].join("\n"), {
    status: 200,
    headers: {
      "content-type": "text/csv; charset=utf-8",
    },
  });
}

