"use client"

import { useUser } from "@/components/providers/AuthProvider"
import AccountSettingsView from "@/features/settings/AccountSettingsView"
import { SkeletonGenericPage } from "@/components/ui/skeleton"

export default function AccountPage() {
  const { user, loading } = useUser()

  if (loading || !user) return <SkeletonGenericPage />

  return <AccountSettingsView embedded={true} />
}

