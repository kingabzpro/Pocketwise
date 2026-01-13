"use client";

import Link from "next/link";
import { SignedIn, SignedOut, SignOutButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export function AuthControls() {
  return (
    <>
      <SignedOut>
        <Link
          href="/login"
          className="rounded-full border border-foreground/20 px-4 py-2 text-sm font-medium text-foreground/80 hover:border-foreground/40"
        >
          Sign in
        </Link>
      </SignedOut>
      <SignedIn>
        <SignOutButton>
          <Button type="button" variant="ghost" size="sm">
            Sign out
          </Button>
        </SignOutButton>
      </SignedIn>
    </>
  );
}
