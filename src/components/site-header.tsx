import Link from "next/link";
import { AuthControls } from "@/components/auth-controls";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-foreground/10 bg-white/70 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4">
        <div className="flex items-center gap-3">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-foreground"
            aria-hidden="true"
          >
            <svg
              viewBox="0 0 48 48"
              className="h-8 w-8"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="sun-mini" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#f5b938" />
                  <stop offset="1" stopColor="#c98400" />
                </linearGradient>
              </defs>
              <rect width="48" height="48" rx="14" fill="#1d1a17" />
              <circle cx="24" cy="20" r="9" fill="url(#sun-mini)" />
              <path
                d="M12 36c5-6 11-9 12-9 2 0 7 3 12 9"
                fill="none"
                stroke="#f7f2ea"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <path
                d="M17 30h14"
                stroke="#f7f2ea"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-foreground/50">
              Pocketwise
            </p>
            <p className="text-lg font-semibold">Spend clearly</p>
          </div>
        </div>
        <nav className="flex items-center gap-3 text-sm">
          <Link
            href="/"
            className="rounded-full border border-transparent px-3 py-2 hover:border-foreground/20"
          >
            Dashboard
          </Link>
          <Link
            href="/add"
            className="rounded-full border border-transparent px-3 py-2 hover:border-foreground/20"
          >
            Add
          </Link>
          <Link
            href="/import"
            className="rounded-full border border-transparent px-3 py-2 hover:border-foreground/20"
          >
            Import
          </Link>
          <AuthControls />
        </nav>
      </div>
    </header>
  );
}
