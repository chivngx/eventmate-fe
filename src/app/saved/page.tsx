import { redirect } from "next/navigation"

export default function SavedEventsPage() {
  redirect("/my-events?tab=saved_job")
}
