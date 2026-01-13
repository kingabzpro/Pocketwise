"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useAction, useConvexAuth, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ExpenseList } from "@/components/expense-list";
import { InsightsSummary } from "@/components/insights-summary";

export function DashboardClient() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const today = useMemo(() => new Date(), []);
  const monthStart = useMemo(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
    [today]
  );
  const [category, setCategory] = useState("All");
  const [from, setFrom] = useState(monthStart.toISOString().slice(0, 10));
  const [to, setTo] = useState(today.toISOString().slice(0, 10));

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 pb-20 pt-10">
        <div className="rounded-3xl border border-foreground/10 bg-white/80 p-8 text-sm text-foreground/60">
          Please{" "}
          <Link href="/login" className="underline">
            sign in
          </Link>{" "}
          to view your dashboard.
        </div>
      </div>
    );
  }

  const categories = useQuery(api.categories.list) ?? [];
  const expenses =
    useQuery(api.expenses.list, {
      category: category === "All" ? undefined : category,
      from,
      to,
    }) ?? [];
  const summary = useQuery(api.expenses.summary, { from, to }) ?? {
    total: 0,
    byCategory: [],
  };

  const exportCsv = useAction(api.expenses.exportCsv);

  const handleExport = async () => {
    const csv = await exportCsv({ from, to });
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `pocketwise-${from}-to-${to}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 px-4 pb-20 pt-10">
      <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-foreground/10 bg-white/70 p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.25em] text-foreground/50">
            Filters
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="h-11 w-full rounded-2xl border border-foreground/10 bg-white/80 px-4 text-sm text-foreground shadow-sm"
              >
                <option value="All">All</option>
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="from">From</Label>
              <Input
                id="from"
                type="date"
                value={from}
                onChange={(event) => setFrom(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="to">To</Label>
              <Input
                id="to"
                type="date"
                value={to}
                onChange={(event) => setTo(event.target.value)}
              />
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button type="button" variant="ghost" onClick={() => void handleExport()}>
              Export CSV
            </Button>
            <Link
              href="/add"
              className="inline-flex h-9 items-center justify-center rounded-full border border-foreground/10 px-3 text-sm font-medium hover:border-foreground/30"
            >
              Add expense
            </Link>
          </div>
        </div>
        <InsightsSummary summary={summary} />
      </div>
      <ExpenseList expenses={expenses} />
    </div>
  );
}
