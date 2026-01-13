# Pocketwise

A deliberately minimal personal budgeting app for fast manual tracking, quick insights, and simple CSV portability.

## Features
- Manual expense entry with optional AI category suggestion
- Simple category management (defaults + custom)
- Filterable expense list and monthly totals
- CSV import/export
- Clerk auth + Neon Postgres data storage

## Tech stack
- Next.js App Router + TypeScript
- Clerk (auth)
- Neon Postgres + Drizzle ORM
- Tailwind CSS + shadcn/ui
- OpenAI (optional, server-side only)

## Local setup
1. Install dependencies:
   ```
   npm install
   ```
2. Add environment variables in `.env.local`:
   ```
   DATABASE_URL=your-neon-postgres-url
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key
   CLERK_SECRET_KEY=your-clerk-secret-key
   CLERK_SIGN_IN_URL=/login
   CLERK_SIGN_UP_URL=/login
   NEBIUS_API_KEY=optional
   ```
3. Push schema to the database:
   ```
   npm run db:push
   ```
4. Run the app:
   ```
   npm run dev
   ```

## CSV format
Use headers: `date,description,category,amount`.

## Deploy (Vercel)
1. Deploy the Next.js app to Vercel.
2. Set Vercel env vars:
   - `DATABASE_URL` (Neon)
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - `CLERK_SIGN_IN_URL=/login`
   - `CLERK_SIGN_UP_URL=/login`
   - `NEBIUS_API_KEY` (optional)

## Build order (commit-by-commit)
1. Project setup (Next.js + Tailwind)
2. Clerk auth + middleware
3. Drizzle schema + Neon setup
4. Expenses data model + list query
5. Add expense form + mutation
6. Insights + filters
7. Categories management
8. CSV export
9. CSV import
10. AI categorization
11. UI polish + README
