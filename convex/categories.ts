import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const DEFAULT_CATEGORIES = [
  "Housing",
  "Utilities",
  "Groceries",
  "Dining",
  "Transportation",
  "Health",
  "Insurance",
  "Entertainment",
  "Subscriptions",
  "Travel",
  "Personal",
  "Gifts",
  "Education",
  "Savings",
  "Misc",
] as const;

function getUserId(identity: { tokenIdentifier: string } | null) {
  if (!identity) {
    throw new Error("Not authenticated");
  }
  return identity.tokenIdentifier;
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = getUserId(await ctx.auth.getUserIdentity());
    const custom = await ctx.db
      .query("categories")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    const merged = new Set<string>(["Uncategorized", ...DEFAULT_CATEGORIES]);
    for (const item of custom) {
      merged.add(item.name);
    }
    return Array.from(merged);
  },
});

export const add = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const userId = getUserId(await ctx.auth.getUserIdentity());
    const name = args.name.trim();
    if (!name) {
      return null;
    }
    const existing = await ctx.db
      .query("categories")
      .withIndex("by_user_name", (q) => q.eq("userId", userId).eq("name", name))
      .unique();
    if (existing) {
      return existing._id;
    }
    return ctx.db.insert("categories", {
      userId,
      name,
      createdAt: Date.now(),
    });
  },
});