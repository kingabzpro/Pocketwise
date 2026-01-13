import {
  pgTable,
  serial,
  text,
  date,
  timestamp,
  boolean,
  doublePrecision,
  index,
} from "drizzle-orm/pg-core";

export const expenses = pgTable(
  "expenses",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    amount: doublePrecision("amount").notNull(),
    description: text("description").notNull(),
    category: text("category").notNull(),
    date: date("date").notNull(),
    createdAt: timestamp("created_at", { mode: "date" })
      .defaultNow()
      .notNull(),
    aiSuggested: boolean("ai_suggested"),
  },
  (table) => ({
    byUser: index("expenses_by_user").on(table.userId),
    byUserDate: index("expenses_by_user_date").on(table.userId, table.date),
  })
);

export const categories = pgTable(
  "categories",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    name: text("name").notNull(),
    createdAt: timestamp("created_at", { mode: "date" })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    byUser: index("categories_by_user").on(table.userId),
    byUserName: index("categories_by_user_name").on(table.userId, table.name),
  })
);

export const aiSuggestions = pgTable(
  "ai_suggestions",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    description: text("description").notNull(),
    category: text("category").notNull(),
    createdAt: timestamp("created_at", { mode: "date" })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    byUserDescription: index("ai_by_user_description").on(
      table.userId,
      table.description
    ),
  })
);

