<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Goal
- Build a world-class Member Dashboard for IAS with premium fintech-grade UI/UX

## Constraints & Preferences
- Next.js, TypeScript, Tailwind CSS, Shadcn UI, Framer Motion, React Query, Recharts, Lucide
- Premium appearance, minimal design, rounded cards, glassmorphism, dark mode, smooth animations
- 15+ pages: Dashboard, Savings, Loans, Loan Applications, Payments, Receivables, Penalties, Statements, Activities, Notifications, Support, Profile, Settings, Wallet, Calendar
- Automatic sync with admin dashboard
- Skeleton loaders, animated counters, sparklines, empty states, responsive design

## Progress
### Done
- Fixed `src/app/admin/interest/page.tsx`: replaced broken API calls (`/api/admin/interest-policy`) with localStorage; removed async from handleSave; fixed error page retry button; removed unused BadgeX import; suppressed "Not Configured" StatusBadge when status is not-configured
- Fixed `src/app/admin/penalties/page.tsx`: replaced broken API calls with localStorage; fixed retry button
- Fixed `src/app/admin/receivables/page.tsx`: changed `itemVariants.visible.opacity` from 0 to 1 (page was invisible); added proper loading state with `setLoading` + `useEffect`
- Rewrote `src/components/dashboard/Sidebar.tsx`: all 16 menu items with active indicator using `layoutId`
- Replaced `src/app/dashboard/layout.tsx`: premium top navigation with search, language switch, dark mode toggle, notification bell with slide-out panel, profile dropdown with current date display; all 15 page titles/icons mapped; sidebar offset updated to `pl-20 lg:pl-[264px]`
- Replaced `src/app/dashboard/page.tsx`: premium home with gradient hero banner (avatar, credit score), 4 quick action cards, Digital Wallet section with 4 summary cards + sparklines, 4 animated stat cards with trend indicators, Financial Insights grid, savings growth chart placeholder, loan status ring progress, savings goals with progress bars, recent transactions, profile summary, quick summary; loading skeleton and error state included
- Replaced `src/app/dashboard/savings/page.tsx`: hero banner with deposit/export buttons, 4 stat cards, savings growth chart placeholder, savings goals section, dividend forecast card, recent savings activity list
- Replaced `src/app/dashboard/loans/page.tsx`: hero banner with available limit, repayment schedule table with animated rows, loan details card, loan calculator with amount/rate/tenure inputs, empty state with apply CTA when no active loan
- Created `src/app/dashboard/loan-applications/page.tsx`: 4 loan product selectors (Development, Emergency, Education, Agriculture), application form with amount/tenure/purpose, live loan summary, application history table with status badges
- Created `src/app/dashboard/payments/page.tsx` (replaces old transactions)
- Created `src/app/dashboard/receivables/page.tsx`
- Created `src/app/dashboard/penalties/page.tsx`
- Created `src/app/dashboard/statements/page.tsx`
- Created `src/app/dashboard/activities/page.tsx`
- Created `src/app/dashboard/notifications/page.tsx`
- Created `src/app/dashboard/support/page.tsx` with tickets, FAQ, and new ticket form
- Created `src/app/dashboard/profile/page.tsx` with editable personal info, contact, emergency contact
- Created `src/app/dashboard/settings/page.tsx` with preferences, notifications toggles, security settings
- Created `src/app/dashboard/wallet/page.tsx` with digital wallet balance, send/add money, recent activity
- Created `src/app/dashboard/calendar/page.tsx` with interactive calendar, events panel, add event modal
- Deleted old `src/app/dashboard/transactions` directory
- All 15 pages verified - `npm run build` succeeds with 62 routes
- Added loan payment flow to loans page: "Pay Now" button on each unpaid schedule row, "Pay Overdue" batch button when missed payments exist, payment modal with amount input, payment method selector (Mobile Money / Bank Transfer / Cash Deposit) with instructions, success state with receipt, local state update on payment (marks month as paid, recalculates paidMonths and remainingBalance)
- Created `src/app/admin/testimonials/page.tsx` — admin CRUD page for member testimonials with list, add/edit modal, delete, reorder (up/down), star rating selector
- Created `src/app/api/admin/testimonials/route.ts` — full CRUD API (GET, POST, PUT, DELETE) backed by SQLite
- Added "Testimonials" nav item to admin sidebar (`src/components/admin/sidebar.tsx`)
- Fixed logout: added `GET` handler to `/api/auth/logout` that clears cookie and redirects to `/login` (was 405 error from admin sidebar/topnav `<Link>`/`<a>` GET requests); fixed POST handler to return `{ success, redirect }` JSON + clear cookie (was broken by redirect override)
- Integrated `ThemeContext` and `LanguageContext` into admin layout (`src/app/admin/layout.tsx`) and topnav (`src/components/admin/topnav.tsx`) — replaces local `darkMode`/`lang` state, admin now shares global theme and language with member dashboard and public site
- Prepared project for Vercel deployment
- Removed nationalId from registration page and API route
- Fixed blob persistence stale connection bug in `src/lib/db.ts`
- **Production transformation**: Added 17 new DB tables (CMS content, FAQ, loan products, loan applications, loans, loan repayments, savings accounts, savings transactions, savings goals, payments, receivables, penalties, interest policies, notifications, member activities, support tickets, calendar events, audit logs)
- Built comprehensive admin **Website Management** page at `/admin/website` with 10 tabs (Hero, About, Contact, Social, Footer, FAQ, Services, Statistics, Partners, News)
- Created 6 admin CMS API routes (`/api/admin/cms`, `/api/admin/faq`, `/api/admin/services`, `/api/admin/partners`, `/api/admin/news`, `/api/admin/interest-policies`, `/api/admin/audit-logs`)
- **Rewrote `/api/dashboard`** from 100% hardcoded mock data to real DB queries
- Created 8 member data APIs (`/api/dashboard/receivables`, `/api/dashboard/penalties`, `/api/dashboard/statements`, `/api/dashboard/activities`, `/api/dashboard/notifications`, `/api/dashboard/wallet`, `/api/dashboard/calendar`, `/api/dashboard/support-tickets`)
- **Rewrote all 8 mock-only dashboard pages** (receivables, penalties, statements, activities, notifications, wallet, calendar, support) to fetch from real APIs with loading/error/empty states
- Updated admin interest page from localStorage to API-backed (`/api/admin/interest-policies`)
- Added audit log system: `src/lib/audit.ts` helper + `/api/admin/audit-logs` route
- Updated registration to auto-create savings account + welcome notification for new members
- Added "Website" navigation item to admin sidebar

### Done (latest)
- Created public `/api/cms` endpoint for public site
- Updated Footer.tsx to fetch address, phone, email, social URLs, and copyright from CMS instead of hardcoded values
- Updated Hero.tsx CentralDashboard to fetch real stats from `/api/statistics` instead of hardcoded RWF 4.2B / 2.4B / 1.8B values
- Added audit log calls (`logAudit`) to `/api/admin/testimonials` (POST/PUT/DELETE) and `/api/admin/settings` (PUT)
- All 84 routes build clean — no TypeScript errors, no lint issues

### In Progress
- None

### Blocked
- None

## Key Decisions
- Replaced broken admin API calls with localStorage for interest/penalty pages to make them work immediately without backend routes
- Sidebar layout changed from `fixed left-4 top-4 h-[calc(100vh-32px)] rounded-[28px]` to `fixed left-0 top-0 h-screen` for full-height premium feel matching Revolut/Monzo pattern
- Dashboard pages follow consistent pattern: gradient hero banner → stat cards grid → main content (2/3 + 1/3 layout or table) → transaction/activity list
- All new pages use `containerVariants`/`itemVariants` for staggered Framer Motion animations
- Loan applications page includes inline eligibility checker for instant feedback
- Settings page uses local state only (no API dependency); Profile page has editable/inline-edit mode
- All 8 previously mock-only dashboard pages now fetch from DB-backed APIs

## Key Patterns
- `const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } }`
- `const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }`
- For cubic bezier: use `ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number]`
- Avoid `Record<string, { icon: React.ElementType; colors: string }>` — use inferred object literals instead to prevent `never` type on icon access
- All components use `"use client"` directive
- Consistent import pattern: `import { cn } from "@/lib/utils"`
- `npm run build` for verification

## Relevant Files
- `src/app/dashboard/page.tsx` — Home with wallet, insights, stat cards, transactions
- `src/app/dashboard/savings/page.tsx` — Savings overview with goals, dividend forecast
- `src/app/dashboard/loans/page.tsx` — Loan details, repayment schedule, calculator, empty state
- `src/app/dashboard/loan-applications/page.tsx` — Loan application form with live calculator
- `src/app/dashboard/payments/page.tsx` — Payment history with filters, search, export
- `src/app/dashboard/receivables/page.tsx` — Receivables tracker with pay-now actions (API-backed)
- `src/app/dashboard/penalties/page.tsx` — Penalty records with expandable details (API-backed)
- `src/app/dashboard/statements/page.tsx` — Monthly/quarterly/annual statement downloads (API-backed)
- `src/app/dashboard/activities/page.tsx` — Activity log grouped by date (API-backed)
- `src/app/dashboard/notifications/page.tsx` — Notifications with mark-read, delete, filters (API-backed)
- `src/app/dashboard/support/page.tsx` — Tickets, FAQ accordion, new ticket form (API-backed)
- `src/app/dashboard/profile/page.tsx` — Editable profile with multiple sections
- `src/app/dashboard/settings/page.tsx` — Preferences, notification toggles, security
- `src/app/dashboard/wallet/page.tsx` — Digital wallet with balance, send/add, history (API-backed)
- `src/app/dashboard/calendar/page.tsx` — Interactive calendar with events, add modal (API-backed)
- `src/app/dashboard/layout.tsx` — Premium top nav with search, dark mode, notifications, profile dropdown
- `src/components/dashboard/Sidebar.tsx` — 16-item sidebar with layoutId active indicator
- `src/app/admin/website/page.tsx` — Admin CMS page with 10 tabs for all website content
- `src/lib/db.ts` — DB schema with all tables, seed data, blob persistence
- `src/lib/audit.ts` — Audit log helper function
- `src/app/api/dashboard/route.ts` — Rewritten with real DB queries
- `src/app/api/dashboard/receivables/route.ts` — Member receivables API
- `src/app/api/dashboard/penalties/route.ts` — Member penalties API
- `src/app/api/dashboard/statements/route.ts` — Member statements API
- `src/app/api/dashboard/activities/route.ts` — Member activities API
- `src/app/api/dashboard/notifications/route.ts` — Member notifications CRUD API
- `src/app/api/dashboard/wallet/route.ts` — Member wallet API
- `src/app/api/dashboard/calendar/route.ts` — Member calendar events API
- `src/app/api/dashboard/support-tickets/route.ts` — Member support tickets API
- `src/app/api/admin/cms/route.ts` — Admin CMS content CRUD API
- `src/app/api/admin/faq/route.ts` — Admin FAQ CRUD API
- `src/app/api/admin/services/route.ts` — Admin services CRUD API
- `src/app/api/admin/partners/route.ts` — Admin partners CRUD API
- `src/app/api/admin/news/route.ts` — Admin news CRUD API
- `src/app/api/admin/interest-policies/route.ts` — Admin interest policies API
- `src/app/api/admin/audit-logs/route.ts` — Admin audit log viewer API
