import OpenAI from "openai";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { aiSuggestions } from "@/db/schema";

export async function POST(request: Request) {
  const { userId } = auth();
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const body = (await request.json()) as {
    description?: string;
    categories?: string[];
  };

  const normalized = body.description?.trim().toLowerCase() ?? "";
  if (!normalized) {
    return NextResponse.json({ category: "Uncategorized" });
  }

  const categories = body.categories ?? [];
  if (categories.length === 0) {
    return NextResponse.json({ category: "Uncategorized" });
  }

  const cached = await db
    .select({ category: aiSuggestions.category })
    .from(aiSuggestions)
    .where(
      and(
        eq(aiSuggestions.userId, userId),
        eq(aiSuggestions.description, normalized)
      )
    )
    .limit(1);

  if (cached.length > 0) {
    return NextResponse.json({ category: cached[0].category });
  }

  const apiKey = process.env.NEBIUS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ category: "Uncategorized" });
  }

  try {
    const client = new OpenAI({
      apiKey,
      baseURL: "https://api.tokenfactory.nebius.com/v1/",
    });
    const response = await client.chat.completions.create({
      model: "openai/gpt-oss-120b",
      temperature: 0,
      messages: [
        {
          role: "system",
          content:
            "You categorize expenses. Return exactly one category from the provided list.",
        },
        {
          role: "user",
          content: `Description: ${normalized}\nCategories: ${categories.join(
            ", "
          )}`,
        },
      ],
    });

    const choice = response.choices[0]?.message?.content?.trim() ?? "";
    const category = categories.includes(choice) ? choice : "Uncategorized";

    await db.insert(aiSuggestions).values({
      userId,
      description: normalized,
      category,
    });

    return NextResponse.json({ category });
  } catch {
    return NextResponse.json({ category: "Uncategorized" });
  }
}

