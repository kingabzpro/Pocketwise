"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuthActions();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const [step, setStep] = useState<"signIn" | "signUp" | { email: string }>(
    "signIn"
  );

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-3xl flex-col justify-center px-4 pb-20 pt-10">
      <div className="rounded-3xl border border-foreground/10 bg-white/80 p-8 shadow-sm">
        <h1 className="text-3xl font-semibold">Welcome back</h1>
        <p className="mt-2 text-sm text-foreground/60">
          Sign in to keep your budget synced on every device.
        </p>

        {step === "signIn" || step === "signUp" ? (
          <form
            className="mt-6 space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              const formData = new FormData(event.currentTarget);
              void signIn("password", formData).then(() => {
                setStep({ email: formData.get("email") as string });
              });
            }}
          >
            <Input name="email" placeholder="Email" type="email" required />
            <Input
              name="password"
              placeholder="Password"
              type="password"
              required
            />
            <input name="flow" value={step} type="hidden" />
            <div className="flex flex-wrap gap-3">
              <Button type="submit">
                {step === "signIn" ? "Sign in" : "Create account"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() =>
                  setStep(step === "signIn" ? "signUp" : "signIn")
                }
              >
                {step === "signIn"
                  ? "Need an account?"
                  : "Already have one?"}
              </Button>
            </div>
          </form>
        ) : (
          <form
            className="mt-6 space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              const formData = new FormData(event.currentTarget);
              void signIn("password", formData);
            }}
          >
            <Input name="code" placeholder="Verification code" type="text" />
            <input name="flow" type="hidden" value="email-verification" />
            <input name="email" value={step.email} type="hidden" />
            <div className="flex flex-wrap gap-3">
              <Button type="submit">Continue</Button>
              <Button type="button" variant="ghost" onClick={() => setStep("signIn")}>
                Cancel
              </Button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
