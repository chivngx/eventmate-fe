# Đề xuất nâng cấp EventMate — Hoàn chỉnh FE & BE

> Cơ sở: audit chi tiết hiện trạng (28 vấn đề, 9 P0 / 8 P1 / 11 P2).
> Mục tiêu: đưa dự án từ "prototype chạy được" lên "production-ready, chỉn chu, an toàn, mở rộng được".

---

## 0. Tóm tắt hiện trạng

| Khía cạnh | Hiện tại | Đánh giá |
|---|---|---|
| Framework | Next.js 16 App Router (migrated từ Vite) | ✅ nền tảng tốt |
| Rendering | 100% client components (17/17 route) | ❌ phí RSC |
| Auth | `@supabase/supabase-js` đơn client, localStorage session, 31 lần `getUser()` lặp | 🔴 không an toàn + chậm |
| DB | 11 bảng, thiếu `interviews`, trigger `handle_new_user` bị comment | 🔴 feature gãy |
| RLS | Có nhưng 3 lỗ hổng critical (applications UPDATE, notifications INSERT, storage) | 🔴 |
| Forms | 14 form dùng `useState` thủ công, 0 validation (RHF+zod cài nhưng chưa dùng) | 🟠 |
| Data fetching | 18 component `useEffect+useState`, react-query cài nhưng 0 dùng | 🟠 |
| UI/UX | 9 modal 0 accessible, 0 loading/error boundary, dark-mode chết, zoom hack | 🟠 |
| SEO | title "eventmate-fe", lang="en", 0 metadata/route, 0 sitemap | 🟠 |
| Test/CI | 0 test, 0 CI, 0 pre-commit | 🔴 |
| Mock data | AdminDashboard transactions, OrgDashboard CV recommendations/chart | 🟠 |
| VIP/Premium | UI đầy đủ nhưng 0 payment, bypass được qua DevTools | 🔴 |

---

## 1. P0 — Critical (phải fix ngay, feature gãy + lỗ hổng bảo mật)

### P0.1 — Sửa schema DB: thêm bảng `interviews` + kích hoạt trigger `handle_new_user`
**Vấn đề:** Bảng `interviews` được code tham chiếu (MyJobs, Chat, ScheduleCalendar) nhưng KHÔNG tồn tại trong `db.sql` → runtime error. Trigger `handle_new_user` bị comment → user đăng ký mới không có row `profiles` → mọi query join profiles gãy.

**Fix:**
```sql
-- 1. Thêm bảng interviews (bidirectional: organizer tạo, student accept/reject)
CREATE TABLE public.interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  organizer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  meeting_link TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','accepted','rejected','completed','cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(event_id, student_id, scheduled_at)
);
CREATE INDEX idx_interviews_student ON public.interviews(student_id, status);
CREATE INDEX idx_interviews_organizer ON public.interviews(organizer_id, status);
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;
-- RLS: student + organizer của interview được read; organizer được insert/update

-- 2. Kích hoạt trigger handle_new_user (chạy 1 lần trong Supabase SQL Editor do cần quyền auth)
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

### P0.2 — Siết RLS (3 lỗ hổng critical)
```sql
-- applications UPDATE: chỉ organizer của event mới được duyệt
DROP POLICY IF EXISTS "Allow update on applications" ON public.applications;
CREATE POLICY "applications_update_organizer_only" ON public.applications
  FOR UPDATE TO authenticated
  USING (auth.uid() IN (SELECT organizer_id FROM public.events WHERE id = event_id))
  WITH CHECK (auth.uid() IN (SELECT organizer_id FROM public.events WHERE id = event_id));

-- notifications INSERT: chỉ service_role (từ trigger/edge function) hoặc self
DROP POLICY IF EXISTS "Bắn thông báo tự" ON public.notifications;
CREATE POLICY "notifications_insert_self_or_service" ON public.notifications
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Storage avatars: ownership theo path prefix = user.id
DROP POLICY IF EXISTS "avatars_insert" ON storage.objects;
CREATE POLICY "avatars_insert_owner" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
-- tương tự cho UPDATE, DELETE
```
+ Xóa `GRANT ALL TO anon` — chỉ giữ `GRANT SELECT` cho anon trên public-read tables.

### P0.3 — Thêm `middleware.ts` + `@supabase/ssr` (auth SSR an toàn)
**Vấn đề:** Không có middleware → `/admin`, `/settings`, `/my-jobs`, `/cv`, `/chat` công khai (auth chỉ check client-side, bypass được). Session lưu localStorage (XSS-exposed).

**Fix:**
- Cài `@supabase/ssr`, tạo `src/lib/supabase/server.ts` (server client đọc httpOnly cookie) + `src/lib/supabase/client.ts` (browser client) + `src/lib/supabase/middleware.ts` (refresh session).
- `src/middleware.ts`: protect `/admin` (role=admin), `/settings|/cv|/my-jobs|/chat|/saved` (logged-in), redirect `/login|/register` nếu đã login → `/`.
- Tạo `src/app/auth/callback/route.ts` xử lý OAuth code exchange (thay hash-cleanup hack).

### P0.4 — Chuyển VIP/premium từ localStorage sang DB
**Vấn đề:** `em_premium_recruiter` trong localStorage → DevTools bypass VIP miễn phí.

**Fix:**
```sql
ALTER TABLE public.profiles ADD COLUMN is_premium BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN premium_until TIMESTAMPTZ;
-- RLS: self SELECT, service_role UPDATE (chỉ webhook payment mới set TRUE)
```
+ Xóa đọc `em_premium_recruiter` khỏi `useOrgDashboard`, đọc từ `profiles.is_premium` (và `premium_until > now()`).

### P0.5 — Security headers trong `next.config.ts`
```ts
const nextConfig: NextConfig = {
  async headers() {
    return [{
      source: '/(.*)',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        // CSP: cho phép supabase + google fonts + google maps + images
        { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co wss://*.supabase.co; frame-ancestors 'none';" },
      ],
    }]
  },
  images: { remotePatterns: [{ protocol: 'https', hostname: '**.supabase.co' }, { protocol: 'https', hostname: 'images.unsplash.com' }] },
}
```

---

## 2. P1 — Kiến trúc & Hiệu năng

### P1.1 — Auth Context thống nhất + `onAuthStateChange`
**Vấn đề:** 31 lời gọi `supabase.auth.getUser()` rải rác, 0 `onAuthStateChange`, login rồi phải `window.location.reload()`.

**Fix:**
- `src/components/providers/AuthProvider.tsx` (client): `getSession()` initial + `onAuthStateChange` listener → cập nhật `user`, `profile` (join profiles) vào context. Cache profile trong React state (không cần localStorage).
- `useUser()` hook: `{ user, profile, role, loading }` — dùng ở mọi nơi thay vì `getUser()` từng page.
- Server: `src/lib/supabase/server.ts` → `createServerClient` đọc cookie → server components có thể lấy session trực tiếp (không cần client island cho auth).

**Tác động:** giảm 31 network calls → 1 (initial) + event-driven updates. Login/logout tức thì, không reload.

### P1.2 — Server Components cho route public
Chuyển 5 route read-only sang RSC (data fetch server-side, truyền xuống client island cho tương tác):
- `/companies`, `/companies/[id]` — fetch profiles + events server-side, client island chỉ cho bookmark/follow.
- `/positions/[position]`, `/events/[category]` — fetch events server-side.
- `/jobs/[id]` — fetch event server-side, `redirect()` UUID→slug ngay server-side (hiện đang client navigate).

**Lợi ích:** HTML có sẵn data (SEO + LCP), giảm JS bundle, giảm client waterfalls.

### P1.3 — Adopt `@tanstack/react-query` (đã cài)
Thay 18 pattern `useEffect+useState` bằng `useQuery`/`useMutation`:
- `useEvents(filters, page)` — events list + pagination + cache.
- `useApplications(studentId)` — applications + invalidation sau apply/withdraw.
- `useChats(role)` — chat list.
- `useEvent(id)` — event detail (dùng cho cả SSR prefetch + client invalidate).
- QueryClientProvider trong `providers.tsx`, `staleTime: 60s`, `refetchOnWindowFocus: false`.

**Lợi ích:** cache + dedup + invalidation + retry + SWR + optimistic update. Bỏ polling 4s trong Chat (dùng `useQuery` + realtime invalidate).

### P1.4 — Adopt `react-hook-form` + `zod` (đã cài)
Chuyển 14 form, ưu tiên form quan trọng:
- AuthModal (login/register) — zod schema email/password/name.
- EventFormModal — zod schema (title, slots ≥1, deadline > today, event_date, ward_id, position_type, category).
- AccountSettings + OrgDashboard profile — zod cho phone/MST/website.
- ReviewModal — zod rating 1-5 + comment.
- Chat interview form — zod scheduled_at > now + meeting_link URL.

**Lợi ích:** validation type-safe, error message nhất quán, dễ test, giảm boilerplate.

### P1.5 — Tách OrgDashboard 1133 dòng + Chat 766 dòng
- `OrgDashboard.tsx` → tách thành 8 file con trong `src/components/organizer/tabs/`: `FeedTab`, `EventsTab`, `CandidatesTab`, `RecommendedTab`, `ReportsTab`, `ServicesTab`, `ChatTab`, `AccountTab`. Container chỉ render tab active.
- `Chat.tsx` → tách: `ChatList`, `ChatThread`, `InterviewModal`, `MessageBubble`. Dùng `next/dynamic` cho `InterviewModal` (chỉ load khi mở).
- Áp dụng `next/dynamic` cho các component nặng (chart, CV preview, certificate modal) — code split.

### P1.6 — Bỏ polling 4s thừa trong Chat/FloatingChat
Hiện chạy cả realtime channel + `setInterval(4000)` → 2x traffic. Giữ realtime, bỏ polling. Nếu lo realtime fail → thêm heartbeat check (mỗi 30s kiểm tra channel status, fallback polling chỉ khi disconnected).

### P1.7 — `next/image` thay raw `<img>`
3 raw `<img>` trong OrgDashboard → `<Image>` (cần `images.remotePatterns` ở P0.5). Lợi ích: WebP/AVIF auto, resize, placeholder blur, LCP optimization.

---

## 3. P2 — UX / SEO / Chất lượng

### P2.1 — Wire dark mode (`next-themes`)
- `providers.tsx` thêm `<ThemeProvider attribute="class" defaultTheme="light" enableSystem>`.
- Thêm toggle button trong UserProfileDropdown hoặc navbar.
- `<html>` thêm `suppressHydrationWarning`.
- Hoặc REMOVE `next-themes` + `.dark` CSS variables nếu không cần dark mode (giảm dead code).

### P2.2 — Bỏ `body { zoom: calc(100vw/1440) }` hack
Thay bằng responsive Tailwind breakpoints (container max-width + fluid spacing). Zoom non-standard gây layout jump, break `position:fixed`, break `window.innerWidth`.

### P2.3 — Modal accessible (9 modal)
Tạo `src/components/ui/Modal.tsx` wrapper (dựa trên `@base-ui/react/dialog` nếu có, hoặc tự build):
- `role="dialog" aria-modal="true" aria-labelledby={headingId}`.
- Focus trap (Tab/Shift+Tab không thoát).
- Escape to close.
- Restore focus to trigger.
- `inert` trên background (chặn interaction).
- Refactor 9 modal hiện tại dùng wrapper này.

### P2.4 — `loading.tsx` + `error.tsx` + `not-found.tsx` + `global-error.tsx`
- `src/app/loading.tsx` — skeleton chung.
- `src/app/error.tsx` — error boundary với "Thử lại" button + report.
- `src/app/not-found.tsx` — 404 thân thiện tiếng Việt.
- `src/app/global-error.tsx` — fallback khi root layout crash.
- Per-segment `loading.tsx` cho route nặng (jobs/[id], companies/[id]).

### P2.5 — SEO metadata
- Root: `title: "EventMate — Việc làm sự kiện cho sinh viên"`, `metadataBase`, `openGraph`, `twitter`, `keywords`, `lang="vi"`.
- Per-route `generateMetadata`:
  - `/jobs/[slug]` → title = event title, description = mô tả.
  - `/companies/[slug]` → title = tên công ty.
  - `/positions/[slug]`, `/events/[slug]` → title theo tên.
- `src/app/sitemap.ts` (dynamic: events + companies + categories + positions).
- `src/app/robots.ts`.
- OG image động: `src/app/opengraph-image.tsx` (dùng `next/og` ImageResponse).

### P2.6 — Cleanup dead code + stale config
- Xóa 3 orphan components: `OrgApplicationsTab`, `FeaturedOrganizers`, `CVSuggestionCard`.
- Xóa 5 dep unused: `@fontsource-variable/geist`, `next-themes` (nếu P2.1 chọn remove), `autoprefixer`, `motion` (refactor RotatingText sang framer-motion). Giữ RHF+zod+react-query (dùng ở P1.3/P1.4).
- Move `shadcn` từ dependencies → devDependencies.
- Sửa `components.json`: `tailwind.config.js` → xóa (Tailwind v4 CSS-first), `src/index.css` → `src/app/globals.css`, `rsc: true`.
- Update `README.md` (hiện là boilerplate Vite).

### P2.7 — Test + CI + pre-commit
- **Vitest** + `@testing-library/react` cho unit/component test (priority: utils, hooks, AuthModal, EventCard).
- **Playwright** cho E2E (critical path: đăng ký → đăng nhập → tìm việc → ứng tuyển → chat).
- `.github/workflows/ci.yml`: lint + typecheck + test trên PR.
- `husky` + `lint-staged`: pre-commit chạy eslint + prettier trên file staged.

### P2.8 — Hoàn thiện features đang mock
- **AdminDashboard transactions**: thêm bảng `transactions` + Edge Function ghi transaction khi payment thành công.
- **OrgDashboard CV recommendations**: Edge Function `match-candidates` — tính match score (skills ↔ event description) server-side, lưu cache 1h.
- **OrgDashboard reports chart**: query aggregation server-side (applications/day, approval rate).
- **VIP/Premium payment**: tích hợp PayOS hoặc VNPay (Vietnam) — tạo `subscriptions` table, Edge Function `create-payment`, webhook route `/api/payment/webhook` update `profiles.is_premium`.

### P2.9 — Observability
- `@sentry/nextjs` — error tracking + performance (free tier).
- `@vercel/analytics` — web vitals + page views.
- Structured logging cho Edge Functions.

### P2.10 — i18n (tùy chọn, nếu cần đa ngôn ngữ)
- `next-intl` — tách string ra `messages/vi.json`, `messages/en.json`. Routing `/en/...`, `/vi/...`.

### P2.11 — Re-enable `eslint-config-next`
Khi upstream fix bug `@eslint/eslintrc` FlatCompat circular → khôi phục `next/core-web-vitals` + `next/typescript` rules (no-img-element, no-html-link, etc.).

---

## 4. BE-specific upgrades (Supabase)

### 4.1 — Schema hoàn chỉnh
- Thêm `interviews` (P0.1).
- Thêm `transactions`, `subscriptions` (P2.8).
- Thêm cột `profiles.is_premium`, `profiles.premium_until` (P0.4).
- Thêm `profiles.is_verified` (cho AdminDashboard verification — hiện là no-op).
- Thêm `events.view_count` + trigger tăng (cho OrgDashboard "lượt xem").
- Full-text search: `ALTER TABLE events ADD COLUMN search_vector tsvector GENERATED ALWAYS AS (to_tsvector('vietnamese', coalesce(title,'') || ' ' || coalesce(description,''))) STORED;` + GIN index. Cho phép search nâng cao thay `ilike`.

### 4.2 — RLS review toàn diện
- Audit từng bảng, áp dụng nguyên tắc: anon chỉ SELECT public data, authenticated SELECT theo ownership/participation, INSERT/UPDATE/DELETE theo ownership.
- Storage: tách 3 bucket — `avatars` (user avatar), `company-images` (organizer gallery), `certificates` (PDF chứng nhận). Mỗi bucket policy ownership theo path prefix.
- Test RLS bằng SQL script `supabase test` (supabase CLI).

### 4.3 — Edge Functions (cho tác vụ nhạy cảm)
- `match-candidates` — tính match score server-side (P2.8).
- `create-payment` — tạo payment intent PayOS/VNPay (P2.8).
- `payment-webhook` — nhận callback, update `is_premium`.
- `send-email` — gửi email welcome/password-reset/interview-scheduled (dùng Resend/Postmark).
- `cleanup-old-chats` — cron xóa chat > 90 ngày không hoạt động.

### 4.4 — Realtime cải tiến
- Thêm `presence` cho chat (typing indicator, online status).
- Broadcast cho read receipts (`messages.read_at`).
- Filter channel theo `chat_id=eq.${chatId}` (hiện đang subscribe all messages rồi check manual).

### 4.5 — Migrations quản lý bằng `supabase CLI`
- `supabase/migrations/` — mỗi thay đổi schema 1 file timestamped.
- `supabase db push` cho dev, `supabase db pull` sync từ remote.
- Bỏ dependency file `db.sql` thủ công.

### 4.6 — Backup + monitoring
- Supabase PITR (Point-in-Time Recovery) cho production.
- Daily backup verify.
- Dashboard alert khi RLS policy fail hoặc query slow.

---

## 5. FE-specific upgrades (Next.js)

### 5.1 — RSC migration (P1.2) — ưu tiên cao
5 route public chuyển sang server component, fetch data server-side, truyền client island cho tương tác.

### 5.2 — State management 3 lớp
- **Server state**: `@tanstack/react-query` (cache, invalidation).
- **Auth state**: `AuthProvider` context (P1.1).
- **UI state**: Zustand cho global UI (modal auth open/close — hiện dùng CustomEvent, nên thay bằng store; theme; sidebar collapse).

### 5.3 — Component library cleanup
- Quyết định: giữ `@base-ui/react` (hiện dùng) HOẶC migrate sang shadcn chuẩn (Radix). Base-ui ít tài liệu hơn Radix; nếu team quen Radix → migrate dần.
- `Modal` wrapper (P2.3), `Form` wrapper (RHF+zod), `DataTable` (TanStack Table cho AdminDashboard), `CommandPalette` (cmdk đã cài) cho search nâng cao.

### 5.4 — Performance checklist
- `next/dynamic` cho 6+ component nặng (chart, CV preview, certificate, OrgDashboard tabs).
- `React.memo` audit: memoize `MessageBubble`, `EventCard` (đã có), `CompanyCard`, `NotificationItem`.
- `useMemo`/`useCallback` cho handler trong OrgDashboard/Chat (hiện 0).
- Bundle analyzer (`@next/bundle-analyzer`) — chạy 1 lần identify heavy chunks.
- `react-virtual` cho danh sách dài (chat messages, applications list) nếu > 100 items.

### 5.5 — Accessibility full audit
- Modal (P2.3).
- Skip-to-content link trong root layout.
- Focus visible nhất quán (đã có ring emerald, audit nốt).
- Color contrast audit (WCAG AA) — slug màu xám `text-slate-400` trên nền trắng có thể fail.
- Screen reader test (NVDA/VoiceOver) critical path.

---

## 6. Lộ trình triển khai (4 phase)

### Phase 1 — Stabilize (P0, ~1-2 ngày)
1. Sửa `db.sql`: thêm `interviews`, kích hoạt `handle_new_user`, siết RLS (P0.1, P0.2).
2. Cài `@supabase/ssr`, tạo server/client/middleware, protect routes, `/auth/callback` (P0.3).
3. Chuyển `is_premium` sang DB (P0.4).
4. Security headers + images config (P0.5).
5. Test: đăng ký mới → có profiles → apply event → organizer duyệt → chat → schedule interview.

### Phase 2 — Architect (P1, ~3-4 ngày)
6. `AuthProvider` + `onAuthStateChange` + `useUser()` (P1.1).
7. Refactor 18 data-fetch → react-query (P1.3).
8. Refactor 14 form → RHF+zod (P1.4).
9. RSC migration 5 route public (P1.2).
10. Tách OrgDashboard + Chat (P1.5).
11. Bỏ polling thừa (P1.6) + `next/image` (P1.7).

### Phase 3 — Polish (P2.1-P2.7, P2.11, ~2-3 ngày)
12. Dark mode wire (P2.1) + bỏ zoom hack (P2.2).
13. Modal accessible wrapper + refactor 9 modal (P2.3).
14. loading/error/not-found/global-error (P2.4).
15. SEO metadata + sitemap + robots + OG (P2.5).
16. Dead code cleanup + config fix (P2.6).
17. Vitest + Playwright + CI + husky (P2.7).
18. Re-enable eslint-config-next (P2.11).

### Phase 4 — Complete features (P2.8-P2.10, ~3-5 ngày)
19. AdminDashboard transactions thật (P2.8).
20. CV recommendations Edge Function (P2.8).
21. Reports chart aggregation (P2.8).
22. VIP payment integration (PayOS/VNPay) (P2.8).
23. Sentry + Vercel Analytics (P2.9).
24. i18n (tùy chọn) (P2.10).

**Tổng: ~9-14 ngày** cho toàn bộ (có thể chạy song song nhiều task).

---

## 7. Kết quả kỳ vọng sau nâng cấp

| Metric | Hiện tại | Sau nâng cấp |
|---|---|---|
| LCP (home) | ~3-4s (client fetch) | <1.5s (RSC + cached) |
| Network calls per page | 5-8 (getUser lặp) | 1-2 (auth context + react-query cache) |
| Bundle JS (initial) | ~heavy (1133-line OrgDashboard ship upfront) | giảm ~30-40% (code split + dynamic) |
| Security (RLS holes) | 3 critical | 0 |
| Auth (session) | localStorage (XSS) | httpOnly cookie (secure) |
| Test coverage | 0% | >60% critical path |
| Accessibility (modal) | 0/9 accessible | 9/9 accessible |
| SEO (metadata) | 1 global | 17 per-route + sitemap + OG |
| Features mock | 4 sites | 0 (toàn bộ real) |
| VIP bypass | DevTools | không (DB + payment) |

---

## 8. Quyết định cần xác nhận với bạn

Trước khi bắt tay vào code, cần bạn chốt:

1. **Dark mode**: wire lên (P2.1) hay gỡ bỏ hoàn toàn?
2. **Component primitive**: giữ `@base-ui/react` hay migrate sang Radix (shadcn chuẩn)?
3. **Payment**: PayOS, VNPay, Momo, hay Stripe? (cho VIP)
4. **i18n**: chỉ tiếng Việt, hay cần đa ngôn ngữ?
5. **Test framework**: Vitest + Playwright OK, hay ưu tiên khác?
6. **Mức độ**: làm hết 4 phase, hay chỉ P0+P1 (stabilize + architect) trước?
7. **Ưu tiên**: muốn tôi bắt đầu phase nào trước?

Sau khi bạn chốt, tôi sẽ triển khai theo phase, mỗi phase commit + verify Agent Browser + cập nhật worklog.
