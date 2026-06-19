import { useNavigate } from "react-router-dom"
import AuthModal from "@/components/auth/AuthModal"

export default function Login() {
  const navigate = useNavigate()
  
  return (
    <AuthModal
      isOpen={true}
      initialMode="login"
      onClose={() => navigate("/")}
    />
  )
}