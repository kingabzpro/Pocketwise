# Pocketwise

A deliberately minimal personal budgeting app for fast manual tracking, quick insights, and simple CSV portability.

## Features
- Manual expense entry with optional AI category suggestion
- Simple category management (defaults + custom)
- Filterable expense list and monthly totals
- CSV import/export
- Convex auth, database, server functions, and file storage

## Tech stack
- Next.js App Router + TypeScript
- Convex (database, functions, auth, file uploads)
- Tailwind CSS + shadcn/ui
- OpenAI (optional, server-side only)

## Local setup
1. Install dependencies:
   ```
   npm install
   ```
2. Start Convex and create a project:
   ```
   npx convex dev
   ```
3. Add environment variables:
   - `.env.local`
     ```
     NEXT_PUBLIC_CONVEX_URL=your-convex-url
     ```
   - Convex dashboard environment:
     ```
     CONVEX_SITE_URL=http://localhost:3000
     NEBIUS_API_KEY=optional
     ```
4. Run the app:
   ```
   npm run dev
   ```

## CSV format
Use headers: `date,description,category,amount`.

## Deploy (Vercel)
1. Deploy the Next.js app to Vercel.
2. Create a production Convex deployment (`npx convex deploy`).
3. Set Vercel env vars:
   - `NEXT_PUBLIC_CONVEX_URL` (from Convex production deployment)
4. Set Convex env vars:
   - `CONVEX_SITE_URL` (your Vercel URL)
   - `NEBIUS_API_KEY` (optional)

## Build order (commit-by-commit)
1. Project setup (Next.js + Tailwind)
2. Convex auth + schema
3. Expenses data model + list query
4. Add expense form + mutation
5. Insights + filters
6. Categories management
7. CSV export
8. CSV import + storage upload
9. AI categorization
10. UI polish + README
