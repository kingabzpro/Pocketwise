"use client";

import Link from "next/link";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";
import { Button } from "@/components/ui/button";

export function AuthControls() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { signOut } = useAuthActions();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return (
      <Link
        href="/login"
        className="rounded-full border border-foreground/20 px-4 py-2 text-sm font-medium text-foreground/80 hover:border-foreground/40"
      >
        Sign in
      </Link>
    );
  }

  return (
    <Button type="button" variant="ghost" size="sm" onClick={() => void signOut()}>
      Sign out
    </Button>
  );
}