import * as Sentry from "@sentry/nextjs"

/**
 * Sentry client-side config.
 *
 * Only activates if NEXT_PUBLIC_SENTRY_DSN is set. When empty (default in
 * .env), Sentry is a no-op — no events sent, no bundle impact beyond the
 * lightweight stub.
 */
if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 0.1, // 10% of transactions traced
    environment: process.env.NODE_ENV,
    // Don't send errors in dev — they're visible in the console already.
    enabled: process.env.NODE_ENV === "production",
  })
}
