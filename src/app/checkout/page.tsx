import { redirect } from "next/navigation"

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const sp = await searchParams
  const query = new URLSearchParams()
  for (const [key, val] of Object.entries(sp)) {
    if (typeof val === "string") query.set(key, val)
    else if (Array.isArray(val) && val[0]) query.set(key, val[0])
  }
  const qs = query.toString()
  redirect(`/pricing/checkout${qs ? `?${qs}` : ""}`)
}
