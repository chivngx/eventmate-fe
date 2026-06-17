import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import {
  AuthInput,
  GoogleSignInButton,
  validateEmail,
  validatePassword,
  EmailIcon,
  LockIcon,
  EyeIcon
} from "@/components/auth-components"

export default function Login() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  // BỘ LẮNG NGHE SỰ KIỆN: Tự động bắt tín hiệu khi Google trả Token về
  useEffect(() => {
    // Kiểm tra xem có phiên đăng nhập nào tồn tại sẵn không
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        window.location.href = "/"
      }
    })

    // Lắng nghe sự thay đổi trạng thái theo thời gian thực (khi OAuth hoàn tất)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        window.location.href = "/"
      }
    })

    return () => subscription.unsubscribe()
  }, [navigate])

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setEmailError(null)
    setPasswordError(null)

    const formData = new FormData(e.currentTarget)
    const email = (formData.get("email") as string || "").trim()
    const password = formData.get("password") as string

    const emailVal = validateEmail(email)
    const passwordVal = validatePassword(password)

    if (emailVal || passwordVal) {
      setEmailError(emailVal)
      setPasswordError(passwordVal)
      return
    }

    setLoading(true)

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      setError("Email hoặc mật khẩu không chính xác. Vui lòng thử lại!")
      setLoading(false)
    } else if (data.user) {
      window.location.href = "/"
    }
  }

  const handleGoogleSignIn = async () => {
    setError(null)
    const { error: oAuthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    })
    if (oAuthError) {
      setError(oAuthError.message)
    }
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 font-sans">
      <div className="w-full max-w-[450px]">
        <form
          onSubmit={handleSignIn}
          className="flex flex-col gap-4 bg-white dark:bg-slate-900 p-8 rounded-[20px] shadow-xl border border-slate-100 dark:border-slate-800/60 transition-all duration-300 hover:shadow-2xl"
        >
          {/* Tiêu đề Form */}
          <div className="flex flex-col space-y-1.5 text-center mb-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Đăng nhập
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Chào mừng bạn trở lại với EventMate
            </p>
          </div>

          {error && (
            <div className="rounded-[10px] bg-red-50 dark:bg-red-950/30 p-3.5 text-sm font-medium text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30 transition-all">
              {error}
            </div>
          )}

          {/* Email Field */}
          <AuthInput
            label="Email"
            name="email"
            type="text"
            placeholder="Nhập email của bạn"
            icon={<EmailIcon />}
            error={emailError}
          />

          {/* Password Field */}
          <AuthInput
            label="Mật khẩu"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Nhập mật khẩu của bạn"
            icon={<LockIcon />}
            error={passwordError}
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors focus:outline-none shrink-0 cursor-pointer ml-2"
              >
                <EyeIcon />
              </button>
            }
          />

          {/* Ghi nhớ & Quên mật khẩu */}
          <div className="flex flex-row items-center justify-between mt-1 select-none">
            <label className="flex items-center gap-2 text-slate-700 dark:text-slate-300 text-sm font-medium cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded text-[#2d79f3] border-slate-300 dark:border-slate-800 bg-transparent focus:ring-[#2d79f3]"
              />
              <span>Ghi nhớ tôi</span>
            </label>
            <a
              href="#"
              className="text-sm font-semibold text-[#2d79f3] hover:underline transition-all"
            >
              Quên mật khẩu?
            </a>
          </div>

          {/* Nút Đăng nhập */}
          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full h-[50px] rounded-[10px] bg-[#151717] hover:bg-[#252727] dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-900 border-none text-white text-[15px] font-semibold cursor-pointer transition-all flex items-center justify-center disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {loading ? "Đang xác thực..." : "Đăng nhập"}
          </button>

          {/* Link Đăng ký */}
          <p className="text-center text-slate-600 dark:text-slate-400 text-sm my-1 font-normal">
            Chưa có tài khoản?{" "}
            <span
              onClick={() => navigate("/register")}
              className="text-[14px] ml-[5px] text-[#2d79f3] font-semibold cursor-pointer hover:underline"
            >
              Đăng ký ngay
            </span>
          </p>

          {/* Ngăn cách */}
          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200 dark:border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-slate-900 px-3 text-slate-400 dark:text-slate-500 font-medium">Hoặc</span>
            </div>
          </div>

          {/* Đăng nhập với Google */}
          <GoogleSignInButton onClick={handleGoogleSignIn} disabled={loading} />
        </form>
      </div>
    </div>
  )
}