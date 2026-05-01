"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Mail, Lock, User, Loader2, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import Link from "next/link"
import { Logo } from "@/components/logo"

export default function RegisterPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      })

      if (res.ok) {
        toast.success("Conta criada com sucesso!")
        router.push("/login")
      } else {
        const error = await res.text()
        toast.error(error || "Erro ao criar conta")
      }
    } catch (error) {
      toast.error("Ocorreu um erro inesperado")
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
          <Logo className="h-48 w-full max-w-[320px]" />
        </div>

        {/* Form Card */}
        <div style={{ backgroundColor: "#1a1a1a", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "28px", padding: "36px", boxShadow: "0 20px 50px rgba(0,0,0,0.5)" }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            
            {/* Nome */}
            <div>
              <label style={{ display: "block", fontSize: "10px", fontWeight: "700", color: "#71717a", textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: "8px" }}>
                Nome Completo
              </label>
              <div style={{ position: "relative" }}>
                <User style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#52525b", width: "20px", height: "20px", pointerEvents: "none" }} />
                <input
                  type="text"
                  placeholder="Seu nome"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={inputStyle}
                  onFocus={(e) => e.currentTarget.style.borderColor = "rgba(168,85,247,0.5)"}
                  onBlur={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"}
                />
              </div>
            </div>

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
                Crie uma Senha
              </label>
              <div style={{ position: "relative" }}>
                <Lock style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#52525b", width: "20px", height: "20px", pointerEvents: "none" }} />
                <input
                  type="password"
                  placeholder="••••••••"
                  required
                  value={password}
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
                background: "linear-gradient(to right, #00E5FF, #6366F1, #A855F7)",
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
                marginTop: "12px"
              }}
            >
              {loading ? <Loader2 style={{ width: "24px", height: "24px", animation: "spin 1s linear infinite" }} /> : <>Criar Conta <ArrowRight style={{ width: "20px", height: "20px" }} /></>}
            </button>
          </form>
        </div>

        <div style={{ marginTop: "32px", textAlign: "center" }}>
          <p style={{ fontSize: "14px", color: "#71717a" }}>
            Já tem uma conta?{" "}
            <Link href="/login" style={{ color: "#38bdf8", fontWeight: "600", textDecoration: "none" }}>
              Fazer Login
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
