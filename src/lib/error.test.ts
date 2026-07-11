import { describe, it, expect, vi, beforeEach } from"vitest"
import { getUserFacingMessage, escapeHtml } from"@/lib/error"

describe("getUserFacingMessage", () => {
 beforeEach(() => {
 // Suppress console.error during tests (helper logs raw error)
 vi.spyOn(console,"error").mockImplementation(() => {})
 })

 it("returns fallback for unknown errors", () => {
 const msg = getUserFacingMessage(new Error("some error"),"Lỗi rồi")
 expect(msg).toBe("Lỗi rồi")
 })

 it("maps Supabase unique-violation code 23505", () => {
 const err = { code:"23505", message:"duplicate key" }
 expect(getUserFacingMessage(err,"fallback")).toBe("Bản ghi đã tồn tại, không thể trùng lặp."
 )
 })

 it("maps Supabase foreign-key code 23503", () => {
 const err = { code:"23503" }
 expect(getUserFacingMessage(err,"fallback")).toBe("Dữ liệu liên quan không tồn tại."
 )
 })

 it("maps Supabase RLS code 42501", () => {
 const err = { code:"42501" }
 expect(getUserFacingMessage(err,"fallback")).toBe("Bạn không có quyền thực hiện thao tác này."
 )
 })

 it("logs raw error to console for dev diagnostics", () => {
 const spy = vi.spyOn(console,"error")
 const err = new Error("internal details")
 getUserFacingMessage(err,"fallback")
 expect(spy).toHaveBeenCalledWith("[EventMate] operation failed:",
 err
 )
 })
})

describe("escapeHtml", () => {
 it("escapes & < > \" '", () => {
 expect(escapeHtml(`<img src=x onerror="alert('xss')">`)).toBe("&lt;img src=x onerror=&quot;alert(&#39;xss&#39;)&quot;&gt;"
 )
 })

 it("escapes &", () => {
 expect(escapeHtml("a & b")).toBe("a &amp; b")
 })

 it("handles null/undefined (converts to empty string)", () => {
 expect(escapeHtml(null as unknown as string)).toBe("")
 expect(escapeHtml(undefined as unknown as string)).toBe("")
 })

 it("passes through plain text unchanged", () => {
 expect(escapeHtml("hello world 123")).toBe("hello world 123")
 })
})
