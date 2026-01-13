import type { Metadata } from "next";
import { Fraunces, Space_Grotesk } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: "Pocketwise",
  description: "A minimal personal budgeting app.",
  icons: {
    icon: "/icon.svg",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider signInUrl="/login">
      <html lang="en">
        <body
          className={`${spaceGrotesk.variable} ${fraunces.variable} antialiased`}
        >
          <SiteHeader />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
