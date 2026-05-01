"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Mail, Lock, Loader2, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import Link from "next/link"
import { Logo } from "@/components/logo"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        toast.error("E-mail ou senha incorretos")
      } else {
        toast.success("Login realizado com sucesso!")
        router.push("/dashboard")
        router.refresh()
      }
    } catch (error) {
      toast.error("Ocorreu um erro ao tentar entrar")
    } finally {
      setLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    height: "56px",
    paddingLeft: "48px",
    paddingRight: "16px",
    backgroundColor: "#0d0d0d",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "16px",
    color: "white",
    fontSize: "16px",
    outline: "none",
    transition: "border-color 0.2s",
    colorScheme: "dark",
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#111111" }}>
      <div style={{ width: "100%", maxWidth: "420px", padding: "24px" }}>
        
        {/* Logo */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "32px" }}>
          <Logo className="h-56 w-full max-w-[360px]" />
        </div>

        {/* Form Card */}
        <div style={{ backgroundColor: "#1a1a1a", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "28px", padding: "36px", boxShadow: "0 20px 50px rgba(0,0,0,0.5)" }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            
            {/* Email */}
            <div>
              <label style={{ display: "block", fontSize: "10px", fontWeight: "700", color: "#71717a", textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: "8px" }}>
                E-mail
              </label>
              <div style={{ position: "relative" }}>
                <Mail style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#52525b", width: "20px", height: "20px", pointerEvents: "none" }} />
                <input
                  type="email"
                  placeholder="seu@email.com"
                  required
                  value={email}
                  autoComplete="email"
                  onChange={(e) => setEmail(e.target.value)}
                  style={inputStyle}
                  onFocus={(e) => e.currentTarget.style.borderColor = "rgba(56,189,248,0.5)"}
                  onBlur={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ display: "block", fontSize: "10px", fontWeight: "700", color: "#71717a", textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: "8px" }}>
                Senha
              </label>
              <div style={{ position: "relative" }}>
                <Lock style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#52525b", width: "20px", height: "20px", pointerEvents: "none" }} />
                <input
                  type="password"
                  placeholder="••••••••"
                  required
                  value={password}
                  autoComplete="current-password"
                  onChange={(e) => setPassword(e.target.value)}
                  style={inputStyle}
                  onFocus={(e) => e.currentTarget.style.borderColor = "rgba(168,85,247,0.5)"}
                  onBlur={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"}
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                height: "56px",
                borderRadius: "16px",
                background: "linear-gradient(to right, #A855F7, #6366F1, #00E5FF)",
                color: "white",
                fontWeight: "700",
                fontSize: "18px",
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              {loading ? <Loader2 style={{ width: "24px", height: "24px", animation: "spin 1s linear infinite" }} /> : <>Entrar <ArrowRight style={{ width: "20px", height: "20px" }} /></>}
            </button>

            <div style={{ textAlign: "center" }}>
              <Link href="#" style={{ fontSize: "14px", color: "#52525b", textDecoration: "none" }}>
                Esqueceu a senha?
              </Link>
            </div>
          </form>
        </div>

        <div style={{ marginTop: "32px", textAlign: "center" }}>
          <p style={{ fontSize: "14px", color: "#71717a" }}>
            Não tem uma conta?{" "}
            <Link href="/register" style={{ color: "#38bdf8", fontWeight: "600", textDecoration: "none" }}>
              Criar conta gratuita
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 1000px #0d0d0d inset !important;
          -webkit-text-fill-color: white !important;
          caret-color: white !important;
        }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
