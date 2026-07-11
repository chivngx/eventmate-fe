/**
 * Sentry instrumentation hook — runs on server startup.
 * Loads sentry.server.config.ts which is a no-op when DSN is empty.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config")
  }
}
