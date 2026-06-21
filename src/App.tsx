import { useEffect } from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Register from "./pages/auth/Register"
import Login from "./pages/auth/Login"
import Home from "./pages/Home"
import AccountSettings from "./pages/settings/AccountSettings"
import CVProfile from "./pages/CVProfile"
import EventDetail from "./pages/EventDetail"
import MyJobs from "./pages/MyJobs"
import CompanyDetail from "./pages/CompanyDetail"
import Chat from "./pages/Chat"
import { ToastProvider } from "./components/ui/ToastProvider"

function App() {
  useEffect(() => {
    const cleanHash = () => {
      if (window.location.href.includes("#")) {
        // Đợi 300ms để Supabase Auth đọc và xử lý token fragment trước khi xóa
        setTimeout(() => {
          window.history.replaceState(
            null,
            "",
            window.location.pathname + window.location.search
          )
        }, 300)
      }
    }
    cleanHash()
    window.addEventListener("hashchange", cleanHash)
    return () => window.removeEventListener("hashchange", cleanHash)
  }, [])

  return (
    <ToastProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/settings" element={<AccountSettings />} />
          <Route path="/cv" element={<CVProfile />} />
          <Route path="/jobs/:id" element={<EventDetail />} />
          <Route path="/my-jobs" element={<MyJobs />} />
          <Route path="/companies/:id" element={<CompanyDetail />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/chat/:id" element={<Chat />} />
        </Routes>
      </Router>
    </ToastProvider>
  )
}

export default App