import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { api } from "./_generated/api";

function getUserId(identity: { tokenIdentifier: string } | null) {
  if (!identity) {
    throw new Error("Not authenticated");
  }
  return identity.tokenIdentifier;
}

export const list = query({
  args: {
    category: v.optional(v.string()),
    from: v.optional(v.string()),
    to: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = getUserId(await ctx.auth.getUserIdentity());
    let results;
    if (args.from || args.to) {
      let q = ctx.db
        .query("expenses")
        .withIndex("by_user_date", (builder) =>
          builder.eq("userId", userId)
        );
      if (args.from) {
        q = q.gte("date", args.from);
      }
      if (args.to) {
        q = q.lte("date", args.to);
      }
      results = await q.collect();
    } else {
      results = await ctx.db
        .query("expenses")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect();
    }
    const filtered = args.category
      ? results.filter((expense) => expense.category === args.category)
      : results;
    return filtered.sort((a, b) => {
      const dateSort = b.date.localeCompare(a.date);
      if (dateSort !== 0) {
        return dateSort;
      }
      return b.createdAt - a.createdAt;
    });
  },
});

export const summary = query({
  args: {
    from: v.optional(v.string()),
    to: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = getUserId(await ctx.auth.getUserIdentity());
    let q = ctx.db
      .query("expenses")
      .withIndex("by_user_date", (builder) => builder.eq("userId", userId));
    if (args.from) {
      q = q.gte("date", args.from);
    }
    if (args.to) {
      q = q.lte("date", args.to);
    }
    const items = await q.collect();
    const totals = new Map<string, number>();
    let total = 0;
    for (const expense of items) {
      total += expense.amount;
      totals.set(
        expense.category,
        (totals.get(expense.category) ?? 0) + expense.amount
      );
    }
    const byCategory = Array.from(totals.entries())
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);
    return { total, byCategory };
  },
});

export const create = mutation({
  args: {
    amount: v.number(),
    description: v.string(),
    category: v.string(),
    date: v.string(),
    aiSuggested: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = getUserId(await ctx.auth.getUserIdentity());
    return ctx.db.insert("expenses", {
      userId,
      amount: args.amount,
      description: args.description.trim(),
      category: args.category,
      date: args.date,
      createdAt: Date.now(),
      aiSuggested: args.aiSuggested,
    });
  },
});

export const createMany = mutation({
  args: {
    items: v.array(
      v.object({
        amount: v.number(),
        description: v.string(),
        category: v.string(),
        date: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const userId = getUserId(await ctx.auth.getUserIdentity());
    const createdAt = Date.now();
    for (const item of args.items) {
      await ctx.db.insert("expenses", {
        userId,
        amount: item.amount,
        description: item.description.trim(),
        category: item.category,
        date: item.date,
        createdAt,
      });
    }
    return args.items.length;
  },
});

export const exportCsv = action({
  args: {
    from: v.optional(v.string()),
    to: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const expenses = await ctx.runQuery(api.expenses.list, {
      from: args.from,
      to: args.to,
    });
    const header = "date,description,category,amount";
    const lines = expenses.map((expense) => {
      const description = expense.description.replaceAll('"', '""');
      const category = expense.category.replaceAll('"', '""');
      return `${expense.date},"${description}","${category}",${expense.amount}`;
    });
    return [header, ...lines].join("\n");
  },
});