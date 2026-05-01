"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { User, Mail, Lock, Loader2, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
      const response = await fetch("/api/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
        headers: { "Content-Type": "application/json" }
      })

      if (response.ok) {
        toast.success("Conta criada com sucesso!")
        router.push("/login")
      } else {
        const data = await response.json()
        toast.error(data.error || "Erro ao criar conta")
      }
    } catch (error) {
      toast.error("Erro na conexão")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0a0a0a] relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#1a1a1a,0%,#0a0a0a_100%)]" />
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
      
      {/* Ambient Lights */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-sky-500/10 blur-[120px] rounded-full" />

      <div className="relative z-10 w-full max-w-[400px] px-6">
        <div className="flex flex-col items-center mb-10">
          <Logo className="h-16 w-16 mb-4" />
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
            Criar Conta
          </h1>
          <p className="text-zinc-400 font-medium text-sm tracking-wide">
            Comece sua jornada no StudyOS hoje
          </p>
        </div>

        <div className="bg-[#141414]/80 backdrop-blur-xl border border-white/5 p-8 rounded-3xl shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-500 uppercase tracking-widest ml-1">
                Nome Completo
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-zinc-600 group-focus-within:text-sky-400 transition-colors" />
                </div>
                <Input
                  placeholder="Seu nome"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10 bg-black/40 border-white/5 text-white h-12 rounded-xl focus:border-sky-500/50 focus:ring-sky-500/20 transition-all placeholder:text-zinc-700"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-500 uppercase tracking-widest ml-1">
                E-mail
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-zinc-600 group-focus-within:text-sky-400 transition-colors" />
                </div>
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-black/40 border-white/5 text-white h-12 rounded-xl focus:border-sky-500/50 focus:ring-sky-500/20 transition-all placeholder:text-zinc-700"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-500 uppercase tracking-widest ml-1">
                Senha
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-zinc-600 group-focus-within:text-purple-400 transition-colors" />
                </div>
                <Input
                  type="password"
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-black/40 border-white/5 text-white h-12 rounded-xl focus:border-purple-500/50 focus:ring-purple-500/20 transition-all placeholder:text-zinc-700"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-sky-500 to-purple-600 hover:from-sky-400 hover:to-purple-500 text-white font-bold text-lg shadow-lg shadow-sky-500/20 transition-all active:scale-[0.98]"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <div className="flex items-center justify-center gap-2">
                  Criar minha conta
                  <ArrowRight className="h-5 w-5" />
                </div>
              )}
            </Button>
          </form>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-zinc-500">
            Já tem uma conta?{" "}
            <Link 
              href="/login" 
              className="text-purple-400 font-semibold hover:text-purple-300 transition-colors"
            >
              Entrar agora
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
