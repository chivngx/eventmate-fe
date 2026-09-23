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
import type { Database } from "@/lib/database.types";

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
  single_event_credits: number | null;
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
  /** Number of purchased Single Event (99k) credits remaining. */
  singleEventCredits: number;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, role, email, full_name, avatar_url, phone, university, bio, skills, slug, cv_completion_percent, is_premium, premium_until, mst, website, scale, address, map_embed_url, is_verified, cv_url, reliability_score, single_event_credits",
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
  const meta = user.user_metadata || {};
  const isOrg = meta.role === "organizer" || p?.role === "organizer";
  const desiredName =
    (isOrg && meta.company_name)
      ? meta.company_name
      : meta.full_name ||
        meta.name ||
        user.email?.split("@")[0] ||
        "Thành viên mới";
  const desiredBio = meta.description || meta.bio || null;
  const desiredScale = meta.scale || meta.company_field || null;

  if (!p) {
    const fallbackRole = meta.role || "student";
    const fallbackAvatar =
      meta.avatar_url || meta.picture || null;

    const newProfile: Database["public"]["Tables"]["profiles"]["Insert"] = {
      id: user.id,
      email: user.email || "",
      full_name: desiredName,
      role: fallbackRole,
      avatar_url: fallbackAvatar,
      bio: desiredBio,
      scale: desiredScale,
    };

    await supabase.from("profiles").upsert(newProfile, { onConflict: "id" });
    p = await fetchProfile(user.id);
  } else if (isOrg) {
    // If existing organizer profile has incomplete info or personal name instead of company name
    const patch: Database["public"]["Tables"]["profiles"]["Update"] = {};
    if (meta.company_name && p.full_name !== meta.company_name) {
      patch.full_name = meta.company_name;
    }
    if (desiredBio && !p.bio) {
      patch.bio = desiredBio;
    }
    if (desiredScale && !p.scale) {
      patch.scale = desiredScale;
    }

    if (Object.keys(patch).length > 0) {
      await supabase.from("profiles").update(patch).eq("id", user.id);
      p = await fetchProfile(user.id);
    }
  }

function dataURItoBlob(dataURI: string): Blob {
  const parts = dataURI.split(",");
  const byteString = atob(parts[1] || "");
  const mimeString = parts[0]?.split(":")[1]?.split(";")[0] || "image/jpeg";
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mimeString });
}

  // Check and upload pending logo from organizer registration
  if (typeof window !== "undefined") {
    const pendingLogo = localStorage.getItem("pending_org_logo");
    if (pendingLogo && user.id) {
      try {
        const blob = dataURItoBlob(pendingLogo);
        const fileExt = blob.type.split("/")[1] || "jpeg";
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(fileName, blob, { contentType: blob.type, upsert: true });

        if (!uploadError) {
          const {
            data: { publicUrl },
          } = supabase.storage.from("avatars").getPublicUrl(fileName);

          await supabase
            .from("profiles")
            .update({ avatar_url: publicUrl })
            .eq("id", user.id);

          localStorage.removeItem("pending_org_logo");
          p = await fetchProfile(user.id);
        } else {
          console.warn("Upload pending logo error:", uploadError);
        }
      } catch (err) {
        console.warn("Failed to upload pending logo from localStorage", err);
      }
    }
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
    singleEventCredits: profile?.single_event_credits ?? 0,
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
