"use client";

import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-3xl flex-col justify-center px-4 pb-20 pt-10">
      <div className="rounded-3xl border border-foreground/10 bg-white/80 p-8 shadow-sm">
        <h1 className="text-3xl font-semibold">Welcome back</h1>
        <p className="mt-2 text-sm text-foreground/60">
          Sign in to keep your budget synced on every device.
        </p>
        <div className="mt-6">
          <SignIn routing="path" path="/login" />
        </div>
      </div>
    </main>
  );
}

