import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AuthInput,
  GoogleSignInButton,
  validateEmail,
  validatePassword,
  EmailIcon,
  LockIcon,
  UserIcon,
  EyeIcon
} from "@/components/auth-components"

export default function Register() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const navigate = useNavigate()

  // Các state lưu lỗi validation cho form Sinh viên
  const [studentNameError, setStudentNameError] = useState<string | null>(null)
  const [studentEmailError, setStudentEmailError] = useState<string | null>(null)
  const [studentPasswordError, setStudentPasswordError] = useState<string | null>(null)

  // Các state lưu lỗi validation cho form Ban tổ chức
  const [orgNameError, setOrgNameError] = useState<string | null>(null)
  const [orgEmailError, setOrgEmailError] = useState<string | null>(null)
  const [orgPasswordError, setOrgPasswordError] = useState<string | null>(null)

  // Trạng thái hiển thị mật khẩu
  const [showStudentPassword, setShowStudentPassword] = useState(false)
  const [showOrgPassword, setShowOrgPassword] = useState(false)

  // BỘ LẮNG NGHE SỰ KIỆN: Bắt tín hiệu khi đăng ký Google thành công
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/")
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        navigate("/")
      }
    })

    return () => subscription.unsubscribe()
  }, [navigate])

  const handleStudentSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)
    setStudentNameError(null)
    setStudentEmailError(null)
    setStudentPasswordError(null)

    const formData = new FormData(e.currentTarget)
    const fullName = (formData.get("fullName") as string || "").trim()
    const email = (formData.get("email") as string || "").trim()
    const password = formData.get("password") as string

    let hasError = false
    if (!fullName) {
      setStudentNameError("Vui lòng nhập họ và tên.")
      hasError = true
    } else if (fullName.length < 2) {
      setStudentNameError("Họ và tên phải có ít nhất 2 ký tự.")
      hasError = true
    }

    const emailVal = validateEmail(email)
    const passwordVal = validatePassword(password)

    if (emailVal) {
      setStudentEmailError(emailVal)
      hasError = true
    }
    if (passwordVal) {
      setStudentPasswordError(passwordVal)
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
      setSuccess("Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.")
    }
    setLoading(false)
  }

  const handleOrgSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)
    setOrgNameError(null)
    setOrgEmailError(null)
    setOrgPasswordError(null)

    const formData = new FormData(e.currentTarget)
    const fullName = (formData.get("fullName") as string || "").trim()
    const email = (formData.get("email") as string || "").trim()
    const password = formData.get("password") as string

    let hasError = false
    if (!fullName) {
      setOrgNameError("Vui lòng nhập tên Đơn vị / CLB.")
      hasError = true
    } else if (fullName.length < 2) {
      setOrgNameError("Tên Đơn vị / CLB phải có ít nhất 2 ký tự.")
      hasError = true
    }

    const emailVal = validateEmail(email)
    const passwordVal = validatePassword(password)

    if (emailVal) {
      setOrgEmailError(emailVal)
      hasError = true
    }
    if (passwordVal) {
      setOrgPasswordError(passwordVal)
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
      setSuccess("Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.")
    }
    setLoading(false)
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
    <div className="relative flex min-h-screen w-full items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 font-sans">
      <div className="w-full max-w-[450px]">
        <div className="flex flex-col gap-4 bg-white dark:bg-slate-900 p-8 rounded-[20px] shadow-xl border border-slate-100 dark:border-slate-800/60 transition-all duration-300 hover:shadow-2xl">

          {/* Tiêu đề Form */}
          <div className="flex flex-col space-y-1.5 text-center mb-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Tạo tài khoản mới
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Nhập thông tin bên dưới để tham gia EventMate
            </p>
          </div>

          {error && (
            <div className="rounded-[10px] bg-red-50 dark:bg-red-950/30 p-3.5 text-sm font-medium text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30 transition-all">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-[10px] bg-green-50 dark:bg-green-950/30 p-3.5 text-sm font-medium text-green-600 dark:text-green-400 border border-green-100 dark:border-green-900/30 transition-all">
              {success}
            </div>
          )}

          <Tabs defaultValue="student" className="w-full">
            <TabsList size="lg" className="grid w-full grid-cols-2 mb-4 bg-slate-100 dark:bg-slate-950 p-1 rounded-[10px]">
              <TabsTrigger
                value="student"
                className="rounded-[8px] font-semibold py-2 cursor-pointer transition-all data-active:bg-white dark:data-active:bg-slate-900 data-active:shadow-sm data-active:text-slate-950 dark:data-active:text-white text-slate-500 dark:text-slate-400 text-sm"
              >
                Sinh viên
              </TabsTrigger>
              <TabsTrigger
                value="organizer"
                className="rounded-[8px] font-semibold py-2 cursor-pointer transition-all data-active:bg-white dark:data-active:bg-slate-900 data-active:shadow-sm data-active:text-slate-950 dark:data-active:text-white text-slate-500 dark:text-slate-400 text-sm"
              >
                Ban tổ chức
              </TabsTrigger>
            </TabsList>

            {/* FORM SINH VIÊN */}
            <TabsContent value="student">
              <form onSubmit={handleStudentSignUp} className="flex flex-col gap-4">
                {/* Họ và tên */}
                <AuthInput
                  label="Họ và tên"
                  name="fullName"
                  type="text"
                  placeholder="Nguyễn Văn A"
                  icon={<UserIcon />}
                  error={studentNameError}
                />

                {/* Email */}
                <AuthInput
                  label="Email cá nhân / trường"
                  name="email"
                  type="text"
                  placeholder="sv@fpt.edu.vn"
                  icon={<EmailIcon />}
                  error={studentEmailError}
                />

                {/* Mật khẩu */}
                <AuthInput
                  label="Mật khẩu"
                  name="password"
                  type={showStudentPassword ? "text" : "password"}
                  placeholder="Nhập ít nhất 6 ký tự"
                  icon={<LockIcon />}
                  error={studentPasswordError}
                  rightElement={
                    <button
                      type="button"
                      onClick={() => setShowStudentPassword(!showStudentPassword)}
                      className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors focus:outline-none shrink-0 cursor-pointer ml-2"
                    >
                      <EyeIcon />
                    </button>
                  }
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 w-full h-[50px] rounded-[10px] bg-blue-600 hover:bg-blue-700 border-none text-white text-[15px] font-semibold cursor-pointer transition-all flex items-center justify-center disabled:opacity-75"
                >
                  {loading ? "Đang xử lý..." : "Đăng ký làm Sinh viên"}
                </button>
              </form>
            </TabsContent>

            {/* FORM BAN TỔ CHỨC */}
            <TabsContent value="organizer">
              <form onSubmit={handleOrgSignUp} className="flex flex-col gap-4">
                {/* Tên Đơn vị / CLB */}
                <AuthInput
                  label="Tên Đơn vị / CLB"
                  name="fullName"
                  type="text"
                  placeholder="CLB Truyền thông FPT"
                  icon={<UserIcon />}
                  error={orgNameError}
                />

                {/* Email Ban tổ chức */}
                <AuthInput
                  label="Email làm việc"
                  name="email"
                  type="text"
                  placeholder="contact@eventmate.vn"
                  icon={<EmailIcon />}
                  error={orgEmailError}
                />

                {/* Mật khẩu Ban tổ chức */}
                <AuthInput
                  label="Mật khẩu"
                  name="password"
                  type={showOrgPassword ? "text" : "password"}
                  placeholder="Nhập ít nhất 6 ký tự"
                  icon={<LockIcon />}
                  error={orgPasswordError}
                  rightElement={
                    <button
                      type="button"
                      onClick={() => setShowOrgPassword(!showOrgPassword)}
                      className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors focus:outline-none shrink-0 cursor-pointer ml-2"
                    >
                      <EyeIcon />
                    </button>
                  }
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 w-full h-[50px] rounded-[10px] bg-[#151717] hover:bg-[#252727] dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-900 border-none text-white text-[15px] font-semibold cursor-pointer transition-all flex items-center justify-center disabled:opacity-75"
                >
                  {loading ? "Đang xử lý..." : "Đăng ký Ban tổ chức"}
                </button>
              </form>
            </TabsContent>
          </Tabs>

          {/* Link Đăng nhập */}
          <p className="text-center text-slate-600 dark:text-slate-400 text-sm my-1 font-normal">
            Đã có tài khoản?{" "}
            <span
              onClick={() => navigate("/login")}
              className="text-[14px] ml-[5px] text-[#2d79f3] font-semibold cursor-pointer hover:underline"
            >
              Đăng nhập ngay
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

          <p className="px-4 text-center text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
            Bằng việc đăng ký, bạn đồng ý với{" "}
            <a href="#" className="underline hover:text-blue-600 transition-colors">
              Điều khoản dịch vụ
            </a>{" "}
            và{" "}
            <a href="#" className="underline hover:text-blue-600 transition-colors">
              Chính sách bảo mật
            </a>{" "}
            của chúng tôi.
          </p>
        </div>
      </div>
    </div>
  )
}