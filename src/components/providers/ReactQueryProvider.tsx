"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

/**
 * React Query provider.
 *
 * Default config:
 * - staleTime 60s: cached data is fresh for 1 minute (reduces refetches).
 * - refetchOnWindowFocus false: don't refetch when user tabs back (the app
 * uses realtime subscriptions for live data; window-focus refetch is noisy).
 * - retry 1: retry failed queries once (default is 3 — too many for a Supabase
 * backend that returns 4xx for RLS denials, which shouldn't be retried).
 */
export function ReactQueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
