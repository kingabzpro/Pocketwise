"use client";

import { useMemo } from "react";

type Summary = {
  total: number;
  byCategory: { category: string; amount: number }[];
};

export function InsightsSummary({ summary }: { summary: Summary }) {
  const formatter = useMemo(
    () =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }),
    []
  );

  return (
    <div className="rounded-3xl border border-foreground/10 bg-white/70 p-6 shadow-sm">
      <p className="text-xs uppercase tracking-[0.25em] text-foreground/50">
        This month
      </p>
      <p className="mt-3 text-3xl font-semibold">
        {formatter.format(summary.total)}
      </p>
      <div className="mt-4 space-y-2 text-sm text-foreground/70">
        {summary.byCategory.length === 0 ? (
          <p className="text-foreground/50">No spending yet.</p>
        ) : (
          summary.byCategory.slice(0, 4).map((item) => (
            <div key={item.category} className="flex items-center justify-between">
              <span>{item.category}</span>
              <span>{formatter.format(item.amount)}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}