import { z } from "zod"

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
        .min(1, "Vui lòng nhập email.")
        .email("Email không đúng định dạng. Ví dụ: name@example.com"),
    password: z
        .string()
        .min(1, "Vui lòng nhập mật khẩu.")
        .min(6, "Mật khẩu phải chứa ít nhất 6 ký tự."),
})
export type LoginValues = z.infer<typeof loginSchema>

export const forgotPasswordSchema = z.object({
    email: z
        .string()
        .trim()
        .min(1, "Vui lòng nhập địa chỉ email.")
        .email("Email không đúng định dạng. Ví dụ: name@example.com"),
})
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>

export const registerSchema = z
    .object({
        fullName: z
            .string()
            .trim()
            .min(1, "Vui lòng nhập họ và tên của bạn.")
            .min(2, "Họ và tên phải có ít nhất 2 ký tự."),
        email: z
            .string()
            .trim()
            .min(1, "Vui lòng nhập địa chỉ email.")
            .email("Email không đúng định dạng. Ví dụ: name@example.com"),
        password: z
            .string()
            .min(1, "Vui lòng nhập mật khẩu.")
            .min(6, "Mật khẩu phải chứa ít nhất 6 ký tự."),
        confirmPassword: z
            .string()
            .min(1, "Vui lòng xác nhận mật khẩu."),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Mật khẩu xác nhận không khớp.",
        path: ["confirmPassword"],
    })
export type RegisterValues = z.infer<typeof registerSchema>
export const jobseekerRegisterSchema = registerSchema
export type JobseekerRegisterValues = RegisterValues

export const employerRegisterSchema = z
    .object({
        fullName: z
            .string()
            .trim()
            .min(1, "Vui lòng nhập họ và tên người đại diện.")
            .min(2, "Họ và tên phải có ít nhất 2 ký tự."),
        role: z
            .string()
            .trim()
            .min(1, "Vui lòng nhập chức vụ / vị trí trong tổ chức.")
            .min(2, "Chức vụ phải có ít nhất 2 ký tự."),
        email: z
            .string()
            .trim()
            .min(1, "Vui lòng nhập email doanh nghiệp / ban tổ chức.")
            .email("Email không đúng định dạng. Ví dụ: contact@company.com"),
        password: z
            .string()
            .min(1, "Vui lòng nhập mật khẩu.")
            .min(6, "Mật khẩu phải chứa ít nhất 6 ký tự."),
        confirmPassword: z
            .string()
            .min(1, "Vui lòng xác nhận mật khẩu."),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Mật khẩu xác nhận không khớp.",
        path: ["confirmPassword"],
    })
export type EmployerRegisterValues = z.infer<typeof employerRegisterSchema>



// ---- Profile / Account ----

export const profileSchema = z.object({
    fullName: z.string().min(1, "Vui lòng nhập họ và tên."),
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
            .min(6, "Mật khẩu mới phải có tối thiểu 6 ký tự."),
        confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Xác nhận mật khẩu không khớp.",
        path: ["confirmPassword"],
    })
export type PasswordChangeValues = z.infer<typeof passwordChangeSchema>

// ---- Event ----

export const eventSchema = z.object({
    title: z.string().min(1, "Vui lòng nhập tiêu đề."),
    description: z.string().min(1, "Vui lòng nhập mô tả."),
    location: z.string().optional(),
    wardId: z.string().min(1, "Vui lòng chọn Phường/Xã."),
    positionType: z.string().min(1, "Vui lòng chọn vị trí."),
    benefits: z.string().min(1, "Vui lòng nhập quyền lợi."),
    category: z.string().min(1, "Vui lòng chọn danh mục."),
    slotsNeeded: z.coerce.number().int().min(1, "Số lượng phải ≥ 1."),
    eventDate: z.string().min(1, "Vui lòng chọn ngày sự kiện."),
    applicationDeadline: z.string().min(1, "Vui lòng chọn hạn đăng ký."),
})
export type EventFormValues = z.infer<typeof eventSchema>

// ---- Review ----

export const reviewSchema = z.object({
    rating: z.coerce.number().int().min(1, "Vui lòng chọn số sao.").max(5),
    comment: z.string().optional(),
})
export type ReviewValues = z.infer<typeof reviewSchema>
