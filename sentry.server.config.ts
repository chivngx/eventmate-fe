import * as Sentry from "@sentry/nextjs"

/**
 * Sentry server-side config.
 *
 * Only activates if NEXT_PUBLIC_SENTRY_DSN (or SENTRY_DSN server-side) is set.
 */
if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 0.1,
    environment: process.env.NODE_ENV,
    enabled: process.env.NODE_ENV === "production",
  })
}
