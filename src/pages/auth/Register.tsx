import { useNavigate } from "react-router-dom"
import AuthModal from "@/components/auth/AuthModal"

export default function Register() {
  const navigate = useNavigate()
  
  return (
    <AuthModal
      isOpen={true}
      initialMode="register"
      onClose={() => navigate("/")}
    />
  )
}