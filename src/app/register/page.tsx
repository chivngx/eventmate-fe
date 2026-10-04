import { redirect } from "next/navigation"

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const sp = await searchParams
  const query = new URLSearchParams()
  query.set("auth", "register")
  for (const [key, value] of Object.entries(sp)) {
    if (typeof value === "string") {
      query.set(key, value)
    }
  }
  redirect(`/?${query.toString()}`)
}
