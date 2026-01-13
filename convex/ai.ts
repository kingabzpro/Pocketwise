import OpenAI from "openai";
import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { api } from "./_generated/api";

function getUserId(identity: { tokenIdentifier: string } | null) {
  if (!identity) {
    throw new Error("Not authenticated");
  }
  return identity.tokenIdentifier;
}

export const getSuggestion = query({
  args: { description: v.string() },
  handler: async (ctx, args) => {
    const userId = getUserId(await ctx.auth.getUserIdentity());
    return ctx.db
      .query("aiSuggestions")
      .withIndex("by_user_description", (q) =>
        q.eq("userId", userId).eq("description", args.description)
      )
      .unique();
  },
});

export const saveSuggestion = mutation({
  args: { description: v.string(), category: v.string() },
  handler: async (ctx, args) => {
    const userId = getUserId(await ctx.auth.getUserIdentity());
    return ctx.db.insert("aiSuggestions", {
      userId,
      description: args.description,
      category: args.category,
      createdAt: Date.now(),
    });
  },
});

export const suggestCategory = action({
  args: {
    description: v.string(),
    categories: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const normalized = args.description.trim().toLowerCase();
    if (!normalized) {
      return "Uncategorized";
    }

    const cached = await ctx.runQuery(api.ai.getSuggestion, {
      description: normalized,
    });
    if (cached) {
      return cached.category;
    }

    const apiKey = process.env.NEBIUS_API_KEY;
    if (!apiKey) {
      return "Uncategorized";
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
            content: `Description: ${normalized}\nCategories: ${args.categories.join(
              ", "
            )}`,
          },
        ],
      });

      const choice = response.choices[0]?.message?.content?.trim() ?? "";
      const category = args.categories.includes(choice)
        ? choice
        : "Uncategorized";

      await ctx.runMutation(api.ai.saveSuggestion, {
        description: normalized,
        category,
      });

      return category;
    } catch {
      return "Uncategorized";
    }
  },
});
