import { z } from"zod"

/**
 * Zod validation schemas for all forms in the app.
 *
 * Used with react-hook-form via @hookform/resolvers/zod.
 * Centralized here so validation rules are consistent and type-safe.
 */

// ---- Auth ----

export const loginSchema = z.object({
 email: z
 .string()
 .min(1,"Vui lòng nhập email.")
 .email("Email không đúng định dạng. Ví dụ: name@example.com"),
 password: z
 .string()
 .min(1,"Vui lòng nhập mật khẩu.")
 .min(6,"Mật khẩu phải chứa ít nhất 6 ký tự."),
})
export type LoginValues = z.infer<typeof loginSchema>

export const registerSchema = z.object({
 fullName: z
 .string()
 .min(1,"Vui lòng nhập họ và tên.")
 .min(2,"Họ và tên phải có ít nhất 2 ký tự."),
 email: z
 .string()
 .min(1,"Vui lòng nhập email.")
 .email("Email không đúng định dạng. Ví dụ: name@example.com"),
 password: z
 .string()
 .min(1,"Vui lòng nhập mật khẩu.")
 .min(6,"Mật khẩu phải chứa ít nhất 6 ký tự."),
})
export type RegisterValues = z.infer<typeof registerSchema>

// ---- Profile / Account ----

export const profileSchema = z.object({
 fullName: z.string().min(1,"Vui lòng nhập họ và tên."),
 phone: z.string().optional(),
 university: z.string().optional(),
 bio: z.string().optional(),
 skills: z.string().optional(),
})
export type ProfileValues = z.infer<typeof profileSchema>

export const passwordChangeSchema = z
 .object({
 newPassword: z
 .string()
 .min(6,"Mật khẩu mới phải có tối thiểu 6 ký tự."),
 confirmPassword: z.string(),
 })
 .refine((data) => data.newPassword === data.confirmPassword, {
 message:"Xác nhận mật khẩu không khớp.",
 path: ["confirmPassword"],
 })
export type PasswordChangeValues = z.infer<typeof passwordChangeSchema>

// ---- Event ----

export const eventSchema = z.object({
 title: z.string().min(1,"Vui lòng nhập tiêu đề."),
 description: z.string().min(1,"Vui lòng nhập mô tả."),
 location: z.string().optional(),
 wardId: z.string().min(1,"Vui lòng chọn Phường/Xã."),
 positionType: z.string().min(1,"Vui lòng chọn vị trí."),
 benefits: z.string().min(1,"Vui lòng nhập quyền lợi."),
 category: z.string().min(1,"Vui lòng chọn danh mục."),
 slotsNeeded: z.coerce.number().int().min(1,"Số lượng phải ≥ 1."),
 eventDate: z.string().min(1,"Vui lòng chọn ngày sự kiện."),
 applicationDeadline: z.string().min(1,"Vui lòng chọn hạn ứng tuyển."),
})
export type EventFormValues = z.infer<typeof eventSchema>

// ---- Review ----

export const reviewSchema = z.object({
 rating: z.coerce.number().int().min(1,"Vui lòng chọn số sao.").max(5),
 comment: z.string().optional(),
})
export type ReviewValues = z.infer<typeof reviewSchema>
