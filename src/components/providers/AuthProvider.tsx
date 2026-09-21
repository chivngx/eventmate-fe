"use client";

/**
 * AuthProvider — centralized Supabase auth + profile state.
 *
 * Replaces the previous pattern where 14+ components each called
 * `supabase.auth.getUser()` + `from("profiles").select(...)` on mount (31
 * redundant network calls). Now a single provider fetches the session and
 * profile once, subscribes to `onAuthStateChange`, and exposes the result
 * via `useUser()`.
 *
 * Session is stored in httpOnly cookies (via @supabase/ssr, see Phase 1
 * Task 2). This provider only reads it reactively — it does NOT store
 * anything in localStorage (the old `em_user_profile` cache is obsolete).
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

/** Subset of the `profiles` row needed across the app. */
export interface Profile {
  id: string;
  role: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  university: string | null;
  bio: string | null;
  skills: string | null;
  slug: string | null;
  cv_completion_percent: number | null;
  is_premium: boolean | null;
  premium_until: string | null;
  mst: string | null;
  website: string | null;
  scale: string | null;
  address: string | null;
  map_embed_url: string | null;
  reliability_score: number | null;
  is_verified: boolean | null;
  cv_url: string | null;
}

interface AuthContextValue {
  user: User | null;
  profile: Profile | null;
  /** Convenience: profile?.role ?? null (null while loading). */
  role: string | null;
  /** True during the initial session/profile fetch. Use to gate render. */
  loading: boolean;
  /** Re-fetch the profile from the DB (e.g. after avatar upload). */
  refreshProfile: () => Promise<void>;
  /** True only when is_premium is set AND premium_until is in the future. */
  isPremium: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, role, email, full_name, avatar_url, phone, university, bio, skills, slug, cv_completion_percent, is_premium, premium_until, mst, website, scale, address, map_embed_url, is_verified, cv_url, reliability_score",
    )
    .eq("id", userId)
    .maybeSingle();
  if (error) {
    console.error("[AuthProvider] fetchProfile failed:", error);
    return null;
  }
  return data as Profile | null;
}

async function ensureProfile(user: User): Promise<Profile | null> {
  let p = await fetchProfile(user.id);
  if (!p) {
    const fallbackName =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split("@")[0] ||
      "Thành viên mới";
    const fallbackRole = user.user_metadata?.role || "student";
    const fallbackAvatar =
      user.user_metadata?.avatar_url || user.user_metadata?.picture || null;

    await supabase.from("profiles").upsert(
      {
        id: user.id,
        email: user.email || "",
        full_name: fallbackName,
        role: fallbackRole,
        avatar_url: fallbackAvatar,
      },
      { onConflict: "id" },
    );

    p = await fetchProfile(user.id);
  }
  return p;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    const p = await fetchProfile(user.id);
    setProfile(p);
  }, [user]);

  // Initial load + subscribe to auth changes.
  useEffect(() => {
    let active = true;

    const init = async () => {
      // getSession() reads from httpOnly cookie (fast, no network when cached).
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!active) return;

      if (session?.user) {
        setUser(session.user);
        const p = await ensureProfile(session.user);
        if (!active) return;
        setProfile(p);
      }
      setLoading(false);
    };
    init();

    // React to sign-in / sign-out / token-refresh. This replaces the
    // `window.location.reload()` hack AuthModal used after login.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!active) return;

      if (event === "SIGNED_OUT" || !session?.user) {
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      setUser(session.user);
      const p = await ensureProfile(session.user);
      if (!active) return;
      setProfile(p);
      setLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const isPremium =
    !!profile?.is_premium &&
    (!profile.premium_until || new Date(profile.premium_until) > new Date());

  const value: AuthContextValue = {
    user,
    profile,
    role: profile?.role ?? null,
    loading,
    refreshProfile,
    isPremium,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useUser(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) {
    throw new Error("useUser must be used within an AuthProvider");
  }
  return ctx;
}
