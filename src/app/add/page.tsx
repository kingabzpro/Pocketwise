"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useAction, useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AddExpensePage() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 pb-20 pt-10">
        <div className="rounded-3xl border border-foreground/10 bg-white/80 p-8 text-sm text-foreground/60">
          Please{" "}
          <Link href="/login" className="underline">
            sign in
          </Link>{" "}
          to add expenses.
        </div>
      </main>
    );
  }

  const categories = useQuery(api.categories.list) ?? ["Uncategorized"];
  const createExpense = useMutation(api.expenses.create);
  const addCategory = useMutation(api.categories.add);
  const suggestCategory = useAction(api.ai.suggestCategory);

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(today);
  const [category, setCategory] = useState("Uncategorized");
  const [newCategory, setNewCategory] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);
    const amountValue = Number(amount);
    if (!description.trim() || Number.isNaN(amountValue)) {
      setStatus("Add a description and a valid amount.");
      return;
    }
    await createExpense({
      description,
      amount: amountValue,
      date,
      category,
    });
    setDescription("");
    setAmount("");
    setStatus("Saved.");
  };

  const handleSuggest = async () => {
    if (!description.trim()) {
      setStatus("Add a description first.");
      return;
    }
    const suggestion = await suggestCategory({
      description,
      categories,
    });
    setCategory(suggestion);
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      return;
    }
    await addCategory({ name: newCategory });
    setNewCategory("");
  };

  return (
    <main className="mx-auto w-full max-w-3xl space-y-10 px-4 pb-20 pt-10">
      <section className="rounded-3xl border border-foreground/10 bg-white/80 p-8 shadow-sm">
        <h1 className="text-3xl font-semibold">Add an expense</h1>
        <p className="mt-2 text-sm text-foreground/60">
          Keep it quick: amount, description, date, category.
        </p>

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Coffee, rent, groceries"
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                inputMode="decimal"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="0.00"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <div className="flex flex-wrap gap-3">
              <select
                id="category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="h-11 flex-1 rounded-2xl border border-foreground/10 bg-white/80 px-4 text-sm"
              >
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <Button type="button" variant="ghost" onClick={() => void handleSuggest()}>
                Suggest
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button type="submit">Save expense</Button>
            {status ? (
              <span className="text-sm text-foreground/60">{status}</span>
            ) : null}
          </div>
        </form>
      </section>

      <section className="rounded-3xl border border-foreground/10 bg-white/70 p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Add a custom category</h2>
        <p className="mt-2 text-sm text-foreground/60">
          Keep it short and memorable.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Input
            value={newCategory}
            onChange={(event) => setNewCategory(event.target.value)}
            placeholder="e.g. Kids"
          />
          <Button type="button" variant="ghost" onClick={() => void handleAddCategory()}>
            Add category
          </Button>
        </div>
      </section>
    </main>
  );
}
