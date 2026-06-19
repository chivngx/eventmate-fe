import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { X } from "lucide-react"
import {
  AuthInput,
  validateEmail,
  validatePassword,
  EmailIcon,
  LockIcon,
  UserIcon,
  EyeIcon,
  GoogleSignInButton
} from "@/components/auth-components"

interface AuthModalProps {
  isOpen: boolean
  initialMode?: "login" | "register"
  onClose: () => void
}

// ==========================================
// 1. LOGIN FORM COMPONENT (LOCAL)
// ==========================================
interface LoginFormProps {
  loading: boolean
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setSuccess: (success: string | null) => void
  onSwitchToRegister: () => void
}

function LoginForm({
  loading,
  setLoading,
  setError,
  setSuccess,
  onSwitchToRegister
}: LoginFormProps) {
  const [emailError, setEmailError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
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
      setError("Email hoặc mật khẩu không chính xác.")
      setLoading(false)
    } else if (data.user) {
      if (window.location.pathname === "/login" || window.location.pathname === "/register") {
        window.location.href = "/"
      } else {
        window.location.reload()
      }
    }
  }

  const handleGoogleSignIn = async () => {
    setError(null)
    setSuccess(null)
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
    <form onSubmit={handleSignIn} className="flex flex-col gap-4">
      <AuthInput
        label="Email"
        name="email"
        type="text"
        placeholder="Nhập email của bạn"
        icon={<EmailIcon />}
        error={emailError}
      />

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
            className="text-slate-400 hover:text-slate-600 transition-colors focus:outline-none ml-2"
          >
            <EyeIcon />
          </button>
        }
      />

      {/* Remember & Forgot Password */}
      <div className="flex items-center justify-between mt-1 select-none text-xs font-semibold">
        <label className="flex items-center gap-1.5 text-slate-600 cursor-pointer">
          <input
            type="checkbox"
            className="w-3.5 h-3.5 rounded text-emerald-600 border-slate-300 bg-transparent focus:ring-emerald-500"
          />
          <span>Ghi nhớ tôi</span>
        </label>
        <a href="#" className="text-emerald-600 hover:underline">
          Quên mật khẩu?
        </a>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-4 w-full h-[48px] rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all flex items-center justify-center disabled:opacity-75"
      >
        {loading ? "Đang xác thực..." : "Đăng nhập"}
      </button>

      <p className="text-center text-slate-500 text-xs mt-2 font-semibold">
        Chưa có tài khoản?{" "}
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="text-emerald-600 font-bold hover:underline"
        >
          Đăng ký ngay
        </button>
      </p>

      {/* Separator */}
      <div className="relative my-2">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-3 text-slate-400 font-medium">Hoặc</span>
        </div>
      </div>

      {/* Google Login */}
      <GoogleSignInButton onClick={handleGoogleSignIn} disabled={loading} />
    </form>
  )
}

// ==========================================
// 2. STUDENT REGISTER FORM COMPONENT (LOCAL)
// ==========================================
interface StudentRegisterFormProps {
  loading: boolean
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setSuccess: (success: string | null) => void
}

function StudentRegisterForm({
  loading,
  setLoading,
  setError,
  setSuccess
}: StudentRegisterFormProps) {
  const [nameError, setNameError] = useState<string | null>(null)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const handleStudentSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)
    setNameError(null)
    setEmailError(null)
    setPasswordError(null)

    const formData = new FormData(e.currentTarget)
    const fullName = (formData.get("fullName") as string || "").trim()
    const email = (formData.get("email") as string || "").trim()
    const password = formData.get("password") as string

    let hasError = false
    if (!fullName) {
      setNameError("Vui lòng nhập họ và tên.")
      hasError = true
    } else if (fullName.length < 2) {
      setNameError("Họ và tên phải có ít nhất 2 ký tự.")
      hasError = true
    }

    const emailVal = validateEmail(email)
    const passwordVal = validatePassword(password)

    if (emailVal) {
      setEmailError(emailVal)
      hasError = true
    }
    if (passwordVal) {
      setPasswordError(passwordVal)
      hasError = true
    }

    if (hasError) {
      setLoading(false)
      return
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: "student",
        },
      },
    })

    if (signUpError) {
      setError(signUpError.message)
    } else if (data.user) {
      setSuccess("Đăng ký thành công! Hãy kiểm tra email để xác thực.")
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleStudentSignUp} className="flex flex-col gap-4">
      <AuthInput
        label="Họ và tên"
        name="fullName"
        type="text"
        placeholder="Nguyễn Văn A"
        icon={<UserIcon />}
        error={nameError}
      />

      <AuthInput
        label="Email cá nhân / trường"
        name="email"
        type="text"
        placeholder="sv@fpt.edu.vn"
        icon={<EmailIcon />}
        error={emailError}
      />

      <AuthInput
        label="Mật khẩu"
        name="password"
        type={showPassword ? "text" : "password"}
        placeholder="Nhập ít nhất 6 ký tự"
        icon={<LockIcon />}
        error={passwordError}
        rightElement={
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-slate-400 hover:text-slate-600 transition-colors focus:outline-none ml-2"
          >
            <EyeIcon />
          </button>
        }
      />

      <button
        type="submit"
        disabled={loading}
        className="mt-4 w-full h-[48px] rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all flex items-center justify-center disabled:opacity-75"
      >
        {loading ? "Đang xử lý..." : "Đăng ký làm Sinh viên"}
      </button>
    </form>
  )
}

// ==========================================
// 3. ORGANIZER REGISTER FORM COMPONENT (LOCAL)
// ==========================================
interface OrgRegisterFormProps {
  loading: boolean
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setSuccess: (success: string | null) => void
}

function OrgRegisterForm({
  loading,
  setLoading,
  setError,
  setSuccess
}: OrgRegisterFormProps) {
  const [nameError, setNameError] = useState<string | null>(null)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const handleOrgSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)
    setNameError(null)
    setEmailError(null)
    setPasswordError(null)

    const formData = new FormData(e.currentTarget)
    const fullName = (formData.get("fullName") as string || "").trim()
    const email = (formData.get("email") as string || "").trim()
    const password = formData.get("password") as string

    let hasError = false
    if (!fullName) {
      setNameError("Vui lòng nhập tên Đơn vị / CLB.")
      hasError = true
    } else if (fullName.length < 2) {
      setNameError("Tên Đơn vị phải có ít nhất 2 ký tự.")
      hasError = true
    }

    const emailVal = validateEmail(email)
    const passwordVal = validatePassword(password)

    if (emailVal) {
      setEmailError(emailVal)
      hasError = true
    }
    if (passwordVal) {
      setPasswordError(passwordVal)
      hasError = true
    }

    if (hasError) {
      setLoading(false)
      return
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: "organizer",
        },
      },
    })

    if (signUpError) {
      setError(signUpError.message)
    } else if (data.user) {
      setSuccess("Đăng ký thành công! Hãy kiểm tra email để xác thực.")
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleOrgSignUp} className="flex flex-col gap-4">
      <AuthInput
        label="Tên Đơn vị / CLB"
        name="fullName"
        type="text"
        placeholder="CLB Truyền thông FPT"
        icon={<UserIcon />}
        error={nameError}
      />

      <AuthInput
        label="Email làm việc"
        name="email"
        type="text"
        placeholder="contact@eventmate.vn"
        icon={<EmailIcon />}
        error={emailError}
      />

      <AuthInput
        label="Mật khẩu"
        name="password"
        type={showPassword ? "text" : "password"}
        placeholder="Nhập ít nhất 6 ký tự"
        icon={<LockIcon />}
        error={passwordError}
        rightElement={
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-slate-400 hover:text-slate-600 transition-colors focus:outline-none ml-2"
          >
            <EyeIcon />
          </button>
        }
      />

      <button
        type="submit"
        disabled={loading}
        className="mt-4 w-full h-[48px] rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all flex items-center justify-center disabled:opacity-75"
      >
        {loading ? "Đang xử lý..." : "Đăng ký Ban tổ chức"}
      </button>
    </form>
  )
}

// ==========================================
// 4. MAIN AUTH MODAL WRAPPER
// ==========================================
export default function AuthModal({ isOpen, initialMode = "login", onClose }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "register">(initialMode)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode)
      setError(null)
      setSuccess(null)

      // Tự động chuyển hướng nếu người dùng đã đăng nhập từ trước
      if (window.location.pathname === "/login" || window.location.pathname === "/register") {
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (session) {
            window.location.href = "/"
          }
        })
      }
    }
  }, [isOpen, initialMode])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-4 animate-in fade-in duration-200">
      {/* Backdrop Click */}
      <div className="absolute inset-0" onClick={onClose}></div>

      {/* Modal Card */}
      <div className="relative w-full max-w-[450px] bg-white rounded-3xl shadow-2xl border border-slate-100 p-8 flex flex-col gap-4 max-h-[95vh] overflow-y-auto z-10 animate-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex flex-col space-y-1.5 text-center mb-2">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            {mode === "login" ? "Đăng nhập" : "Tạo tài khoản mới"}
          </h2>
          <p className="text-sm text-slate-500">
            {mode === "login"
              ? "Chào mừng bạn trở lại với EventMate"
              : "Nhập thông tin bên dưới để tham gia EventMate"}
          </p>
        </div>

        {/* Global Messages */}
        {error && (
          <div className="rounded-[10px] bg-red-50 p-3.5 text-sm font-medium text-red-600 border border-red-100">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-[10px] bg-green-50 p-3.5 text-sm font-medium text-green-600 border border-green-100">
            {success}
          </div>
        )}

        {mode === "login" ? (
          <LoginForm
            loading={loading}
            setLoading={setLoading}
            setError={setError}
            setSuccess={setSuccess}
            onSwitchToRegister={() => {
              setMode("register")
              setError(null)
              setSuccess(null)
            }}
          />
        ) : (
          <div className="flex flex-col gap-4">
            <Tabs defaultValue="student" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-slate-100 rounded-xl p-1 mb-4 h-10">
                <TabsTrigger
                  value="student"
                  className="rounded-lg font-bold py-2 cursor-pointer transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-slate-950 text-slate-500 text-xs"
                >
                  Sinh viên
                </TabsTrigger>
                <TabsTrigger
                  value="organizer"
                  className="rounded-lg font-bold py-2 cursor-pointer transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-slate-950 text-slate-500 text-xs"
                >
                  Ban tổ chức
                </TabsTrigger>
              </TabsList>

              <TabsContent value="student">
                <StudentRegisterForm
                  loading={loading}
                  setLoading={setLoading}
                  setError={setError}
                  setSuccess={setSuccess}
                />
              </TabsContent>

              <TabsContent value="organizer">
                <OrgRegisterForm
                  loading={loading}
                  setLoading={setLoading}
                  setError={setError}
                  setSuccess={setSuccess}
                />
              </TabsContent>
            </Tabs>

            <p className="text-center text-slate-500 text-xs mt-2 font-semibold">
              Đã có tài khoản?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("login")
                  setError(null)
                  setSuccess(null)
                }}
                className="text-emerald-600 font-bold hover:underline"
              >
                Đăng nhập ngay
              </button>
            </p>
          </div>
        )}

        <p className="px-4 text-center text-[10px] text-slate-400 leading-relaxed mt-2 font-semibold">
          Bằng việc tiếp tục, bạn đồng ý với{" "}
          <a href="#" className="underline hover:text-emerald-600 transition-colors">
            Điều khoản dịch vụ
          </a>{" "}
          và{" "}
          <a href="#" className="underline hover:text-emerald-600 transition-colors">
            Chính sách bảo mật
          </a>{" "}
          của chúng tôi.
        </p>
      </div>
    </div>
  )
}
