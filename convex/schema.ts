import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,
  users: defineTable({
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
  }).index("email", ["email"]),
  expenses: defineTable({
    userId: v.string(),
    amount: v.number(),
    description: v.string(),
    category: v.string(),
    date: v.string(),
    createdAt: v.number(),
    aiSuggested: v.optional(v.boolean()),
  })
    .index("by_user", ["userId"])
    .index("by_user_date", ["userId", "date"]),
  categories: defineTable({
    userId: v.string(),
    name: v.string(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_name", ["userId", "name"]),
  aiSuggestions: defineTable({
    userId: v.string(),
    description: v.string(),
    category: v.string(),
    createdAt: v.number(),
  }).index("by_user_description", ["userId", "description"]),
});