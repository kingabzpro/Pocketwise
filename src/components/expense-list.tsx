"use client";

import { useMemo } from "react";

type Expense = {
  id: number;
  amount: number;
  description: string;
  category: string;
  date: string;
  aiSuggested?: boolean | null;
};

export function ExpenseList({ expenses }: { expenses: Expense[] }) {
  const formatter = useMemo(
    () =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }),
    []
  );

  if (expenses.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-foreground/20 p-8 text-center text-sm text-foreground/60">
        No expenses yet. Add one in under 10 seconds.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {expenses.map((expense) => (
        <div
          key={expense.id}
          className="flex items-center justify-between rounded-3xl border border-foreground/10 bg-white/70 px-5 py-4 shadow-sm"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-foreground">
                {expense.description}
              </p>
              {expense.aiSuggested ? (
                <span className="rounded-full bg-foreground/5 px-2 py-1 text-[11px] uppercase tracking-widest text-foreground/50">
                  AI
                </span>
              ) : null}
            </div>
            <div className="flex items-center gap-3 text-xs text-foreground/50">
              <span>{expense.category}</span>
              <span>-</span>
              <span>{expense.date}</span>
            </div>
          </div>
          <p className="text-sm font-semibold">
            {formatter.format(expense.amount)}
          </p>
        </div>
      ))}
    </div>
  );
}

