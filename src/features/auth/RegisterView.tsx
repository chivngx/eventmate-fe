"use client"

import { useSearchParams } from "@/lib/router"
import StudentSignUpView from "./StudentSignUpView"
import OrganizerSignUpView from "./OrganizerSignUpView"

export default function Register() {
    const [searchParams] = useSearchParams()
    const role = searchParams.get("role") || searchParams.get("type")

    if (role === "organizer" || role === "employer") {
        return <OrganizerSignUpView />
    }

    return <StudentSignUpView />
}