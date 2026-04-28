# PMO-OVERWATCH (Phase 1 Beta)

מערכת לניהול לו"ז פרויקטי בינוי ושיפוץ עבור PMO, מבוססת על Next.js + Supabase + Vercel.

## Stack
- Next.js 14 (App Router, TypeScript)
- Supabase (Auth + Postgres + RLS)
- Vercel deployment

## Quick Start
1. התקן תלויות: `npm install`
2. העתק `.env.example` ל-`.env.local` ומלא ערכים
3. הרץ: `npm run dev`

## Supabase
1. צור פרויקט Supabase
2. הרץ SQL מתוך `supabase/migrations/20260428_001_init.sql`
3. אופציונלי seed: `supabase/seed/seed.sql`
4. הפעל Google provider ב-Auth

## Vercel
1. Import project from Git
2. הגדר משתני סביבה: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
3. Deploy

## Implemented Beta Scope
- 7 מסכים: Dashboard, Project Card, Quick Update, Management Report, 30-Day Forward, Lists, Users
- RTL Hebrew-first layout
- Status calculation utilities
- Health endpoint: `/api/health`
- Supabase schema + baseline RLS policies

## Next Implementation Steps
- חיבור המסכים לדאטה אמיתי (כרגע sample-data)
- Server actions לעדכונים מלאים + validation rules מלאים
- Snapshot delta logic מלא
- E2E + permission tests
