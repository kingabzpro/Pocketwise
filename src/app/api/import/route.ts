import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { expenses } from "@/db/schema";

function parseCsv(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (!inQuotes && (char === "," || char === "\n")) {
      row.push(current.trim());
      current = "";
      if (char === "\n") {
        rows.push(row);
        row = [];
      }
      continue;
    }

    if (char === "\r") {
      continue;
    }

    current += char;
  }

  if (current.length > 0 || row.length > 0) {
    row.push(current.trim());
    rows.push(row);
  }

  return rows;
}

function normalizeDate(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }
  const direct = new Date(trimmed);
  if (!Number.isNaN(direct.getTime())) {
    return direct.toISOString().slice(0, 10);
  }
  return trimmed;
}

export async function POST(request: Request) {
  const { userId } = auth();
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return new NextResponse("Missing file", { status: 400 });
  }

  const text = await file.text();
  const rows = parseCsv(text).filter((row) => row.some((cell) => cell));
  if (rows.length === 0) {
    return NextResponse.json({ count: 0 });
  }

  const header = rows[0].map((cell) => cell.toLowerCase().trim());
  const dateIndex = header.indexOf("date");
  const descriptionIndex = header.indexOf("description");
  const categoryIndex = header.indexOf("category");
  const amountIndex = header.indexOf("amount");

  if (dateIndex === -1 || descriptionIndex === -1 || amountIndex === -1) {
    return new NextResponse(
      "CSV must include date, description, and amount columns",
      { status: 400 }
    );
  }

  const createdAt = new Date();
  const items = rows.slice(1).flatMap((row) => {
    const description = row[descriptionIndex]?.trim();
    const amountValue = Number(row[amountIndex]);
    const dateValue = normalizeDate(row[dateIndex] ?? "");
    if (!description || Number.isNaN(amountValue) || !dateValue) {
      return [];
    }
    const category =
      categoryIndex !== -1 && row[categoryIndex]
        ? row[categoryIndex].trim()
        : "Uncategorized";
    return [
      {
        userId,
        amount: amountValue,
        description,
        date: dateValue,
        category,
        createdAt,
      },
    ];
  });

  if (items.length === 0) {
    return NextResponse.json({ count: 0 });
  }

  await db.insert(expenses).values(items);
  return NextResponse.json({ count: items.length });
}

