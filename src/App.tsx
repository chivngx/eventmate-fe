import { useEffect } from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Register from "./pages/auth/Register"
import Login from "./pages/auth/Login"
import Home from "./pages/Home"
import AccountSettings from "./pages/settings/AccountSettings"
import CVProfile from "./pages/cv/CVProfile"
import EventDetail from "./pages/event/EventDetail"
import MyJobs from "./pages/job/MyJobs"
import CompanyDetail from "./pages/company/CompanyDetail"
import CompanyList from "./pages/company/CompanyList"
import Chat from "./pages/chat/Chat"
import JobsByPosition from "./pages/job/JobsByPosition"
import JobsByEvent from "./pages/event/JobsByEvent"
import SavedJobs from "./pages/job/SavedJobs"
import AdminDashboard from "./pages/dashboard/AdminDashboard"
import { ToastProvider } from "./components/ui/ToastProvider"
import OnboardingOverlay from "./components/ui/OnboardingOverlay"

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
        <OnboardingOverlay />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/settings" element={<AccountSettings />} />
          <Route path="/cv" element={<CVProfile />} />
          <Route path="/jobs/:id" element={<EventDetail />} />
          <Route path="/my-jobs" element={<MyJobs />} />
          <Route path="/companies" element={<CompanyList />} />
          <Route path="/companies/:id" element={<CompanyDetail />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/chat/:id" element={<Chat />} />
          <Route path="/positions/:position" element={<JobsByPosition />} />
          <Route path="/events/:category" element={<JobsByEvent />} />
          <Route path="/saved" element={<SavedJobs />} />
          <Route path="/admin" element={<AdminDashboard />} />
          {/* Backwards compatibility */}
          <Route path="/jobs-by-position" element={<JobsByPosition />} />
          <Route path="/jobs-by-event" element={<JobsByEvent />} />
        </Routes>
      </Router>
    </ToastProvider>
  )
}

export default App
