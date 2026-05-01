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
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0a0a0a] relative overflow-hidden font-sans">
      {/* Background with texture */}
      <div className="absolute inset-0 bg-[#121212]" />
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]" />
      
      <div className="relative z-10 w-full max-w-[420px] px-6 py-12">
        <div className="flex flex-col items-center mb-12">
          <Logo className="h-20 w-20 mb-6" />
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
            Criar Conta
          </h1>
          <p className="text-zinc-500 font-medium text-sm text-center">
            Junte-se à jornada e transforme seu conhecimento
          </p>
        </div>

        <div className="bg-[#1a1a1a] border border-white/5 p-10 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] ml-1">
                Nome Completo
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-zinc-600 group-focus-within:text-sky-400 transition-colors" />
                </div>
                <Input
                  placeholder="Seu nome"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-12 bg-[#0d0d0d] border-white/10 text-white h-14 rounded-2xl focus:border-sky-500/50 focus:ring-0 transition-all placeholder:text-zinc-800"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] ml-1">
                E-mail
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-zinc-600 group-focus-within:text-sky-400 transition-colors" />
                </div>
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-12 bg-[#0d0d0d] border-white/10 text-white h-14 rounded-2xl focus:border-sky-500/50 focus:ring-0 transition-all placeholder:text-zinc-800"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] ml-1">
                Senha
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-zinc-600 group-focus-within:text-purple-400 transition-colors" />
                </div>
                <Input
                  type="password"
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-12 bg-[#0d0d0d] border-white/10 text-white h-14 rounded-2xl focus:border-purple-500/50 focus:ring-0 transition-all placeholder:text-zinc-800"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-14 rounded-2xl bg-gradient-to-r from-[#00E5FF] to-[#A855F7] hover:opacity-90 text-white font-bold text-lg shadow-xl shadow-sky-500/10 transition-all active:scale-[0.98]"
            >
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <div className="flex items-center justify-center gap-2">
                  Criar minha conta
                  <ArrowRight className="h-5 w-5" />
                </div>
              )}
            </Button>
          </form>
        </div>

        <div className="mt-10 text-center">
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
