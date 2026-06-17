import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Register from "./pages/auth/Register"
import Login from "./pages/auth/Login"
import Home from "./pages/Home"
import AccountSettings from "./pages/settings/AccountSettings"
import CVProfile from "./pages/CVProfile"
import EventDetail from "./pages/EventDetail"
import MyJobs from "./pages/MyJobs" // THÊM DÒNG IMPORT NÀY

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/settings" element={<AccountSettings />} />
        <Route path="/cv" element={<CVProfile />} />
        <Route path="/jobs/:id" element={<EventDetail />} />

        {/* THÊM DÒNG ROUTE NÀY VÀO LÀ CHẠY */}
        <Route path="/my-jobs" element={<MyJobs />} />
      </Routes>
    </Router>
  )
}

export default App