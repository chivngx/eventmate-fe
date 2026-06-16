import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Register from "./pages/auth/Register"
import Login from "./pages/auth/Login"
import Home from "./pages/Home"
import AccountSettings from "./pages/AccountSettings"

function App() {
  return (
    <Router>
      <Routes>
        {/* Trang Home bây giờ là trung tâm, phải đăng nhập mới được vào */}
        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/settings" element={<AccountSettings />} />
      </Routes>
    </Router>
  )
}

export default App