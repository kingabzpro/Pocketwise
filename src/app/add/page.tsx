"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AddExpensePage() {
  const { isLoaded, isSignedIn } = useUser();
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const [categories, setCategories] = useState<string[]>(["Uncategorized"]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(today);
  const [category, setCategory] = useState("Uncategorized");
  const [newCategory, setNewCategory] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!isSignedIn) {
      return;
    }
    void fetch("/api/categories")
      .then((response) => (response.ok ? response.json() : ["Uncategorized"]))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setCategories(data);
          if (!data.includes(category)) {
            setCategory(data[0]);
          }
        }
      });
  }, [isSignedIn, category]);

  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn) {
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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);
    const amountValue = Number(amount);
    if (!description.trim() || Number.isNaN(amountValue)) {
      setStatus("Add a description and a valid amount.");
      return;
    }
    const response = await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        description,
        amount: amountValue,
        date,
        category,
      }),
    });
    if (!response.ok) {
      setStatus("Could not save expense.");
      return;
    }
    setDescription("");
    setAmount("");
    setStatus("Saved.");
  };

  const handleSuggest = async () => {
    if (!description.trim()) {
      setStatus("Add a description first.");
      return;
    }
    const response = await fetch("/api/ai/suggest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        description,
        categories,
      }),
    });
    if (!response.ok) {
      setStatus("Suggestion unavailable.");
      return;
    }
    const data = (await response.json()) as { category?: string };
    if (data.category) {
      setCategory(data.category);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      return;
    }
    const response = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newCategory }),
    });
    if (!response.ok) {
      return;
    }
    setNewCategory("");
    const updated = await fetch("/api/categories");
    if (updated.ok) {
      const data = (await updated.json()) as string[];
      if (Array.isArray(data)) {
        setCategories(data);
      }
    }
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
