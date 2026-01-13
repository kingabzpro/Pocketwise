"use client";

import { useState } from "react";
import { useAction, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ImportPage() {
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const importCsv = useAction(api.imports.importCsv);
  const [status, setStatus] = useState<string | null>(null);
  const [count, setCount] = useState<number | null>(null);

  const handleUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);
    setCount(null);

    const form = event.currentTarget;
    const fileInput = form.elements.namedItem("file") as HTMLInputElement | null;
    const file = fileInput?.files?.[0];

    if (!file) {
      setStatus("Choose a CSV file first.");
      return;
    }

    setStatus("Uploading...");
    const uploadUrl = await generateUploadUrl();
    const response = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        "Content-Type": file.type || "text/csv",
      },
      body: file,
    });

    if (!response.ok) {
      setStatus("Upload failed.");
      return;
    }

    const { storageId } = (await response.json()) as { storageId: string };
    setStatus("Importing...");
    const imported = await importCsv({ storageId });
    setCount(imported);
    setStatus("Done.");
    form.reset();
  };

  return (
    <main className="mx-auto w-full max-w-3xl space-y-10 px-4 pb-20 pt-10">
      <section className="rounded-3xl border border-foreground/10 bg-white/80 p-8 shadow-sm">
        <h1 className="text-3xl font-semibold">Import CSV</h1>
        <p className="mt-2 text-sm text-foreground/60">
          CSV headers: date, description, category, amount.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleUpload}>
          <Input name="file" type="file" accept=".csv,text/csv" />
          <Button type="submit">Upload and import</Button>
        </form>

        {status ? (
          <p className="mt-4 text-sm text-foreground/60">{status}</p>
        ) : null}
        {count !== null ? (
          <p className="mt-2 text-sm text-foreground/60">
            Imported {count} expenses.
          </p>
        ) : null}
      </section>
    </main>
  );
}