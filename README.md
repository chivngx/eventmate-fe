# EventMate

Nền tảng kết nối nhân sự và cơ hội việc làm sự kiện hàng đầu dành cho sinh viên và ban tổ chức tại Đà Nẵng.

## Tech Stack

- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript 6
- **Styling**: Tailwind CSS 4 + shadcn/ui (base-nova style trên `@base-ui/react`)
- **Backend**: Supabase (Auth + Postgres + Realtime + Storage) qua `@supabase/ssr` (httpOnly cookie session)
- **State**: React Context (auth) + TanStack Query (server state) + react-hook-form + zod (forms)
- **Animation**: framer-motion + motion/react

## Getting Started

```bash
# Install dependencies
bun install

# Start dev server (port 3000)
bun run dev

# Lint
bun run lint

# Build for production
bun run build
```

## Environment

Create `.env` with:

```
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
```

## Database

Supabase migrations live in `supabase/migrations/`. Run them in the Supabase Dashboard → SQL Editor (the app only has the anon key, so DDL can't run via REST).

See `supabase/migrations/README.md` for instructions.

## Project Structure

```
src/
├── app/              # Next.js App Router (routes + layout + providers)
│   ├── layout.tsx    # Root layout + metadata
│   ├── providers.tsx # AuthProvider + ReactQueryProvider + ToastProvider
│   ├── loading.tsx   # Route loading state
│   ├── error.tsx     # Error boundary
│   ├── not-found.tsx # 404 page
│   └── */page.tsx    # Route re-exports (17 routes)
├── components/
│   ├── providers/    # AuthProvider, ReactQueryProvider
│   ├── layout/       # MainLayout, NotchNavbar, Footer, OrgLayout
│   ├── auth/         # AuthModal, AuthComponents
│   ├── ui/           # shadcn primitives + Modal wrapper + Toast + Skeleton
│   ├── event/        # EventCard, EventFormModal, OrgEventsTab
│   ├── organizer/tabs/ # OrgDashboard tab components (AccountTab, ...)
│   ├── chat/         # FloatingChat, InterviewModal
│   └── cv/           # CVPreviewModal, CVViewModal
├── hooks/            # use-lookups (wards, positions, categories via react-query)
├── lib/              # supabase (browser), supabase-server, supabase-middleware, error, schemas, utils, router (compat)
└── pages/            # Page components (16) + co-located hooks (3)
```

## Standards

Development follows 3 standards (see `.standards/`):
- **Performance.md** (Bolt ⚡) — memoization, lazy loading, cache
- **Design.md** (Palette 🎨) — ARIA labels, focus states, accessibility
- **Security.md** (Sentinel 🛡️) — input validation, error sanitization, RLS

See `.standards/UPGRADE_PROPOSAL.md` for the full upgrade roadmap (Phase 1-4).
