import { describe, it, expect } from "vitest"
import { cn } from "@/lib/utils"

describe("cn (className merge helper)", () => {
  it("joins multiple class strings", () => {
    expect(cn("foo", "bar")).toBe("foo bar")
  })

  it("handles conditional classes (falsy values ignored)", () => {
    const includeYes = true
    const includeNo = false
    expect(cn("base", includeNo && "no", includeYes && "yes", undefined, null)).toBe(
      "base yes"
    )
  })

  it("dedupes conflicting Tailwind classes (tailwind-merge)", () => {
    // Later class wins for the same property
    expect(cn("px-2", "px-4")).toBe("px-4")
    expect(cn("text-sm", "text-lg")).toBe("text-lg")
  })

  it("merges non-conflicting classes", () => {
    expect(cn("p-2", "text-center")).toBe("p-2 text-center")
  })
})
