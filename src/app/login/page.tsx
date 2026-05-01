"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Mail, Lock, Loader2, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0a0a0a] relative overflow-hidden font-sans">
      {/* Background with texture */}
      <div className="absolute inset-0 bg-[#121212]" />
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]" />
      
      <div className="relative z-10 w-full max-w-[420px] px-6 py-12">
        <div className="flex flex-col items-center mb-12">
          <Logo className="h-24 w-24" showText={true} />
        </div>

        <div className="bg-[#1a1a1a] border border-white/5 p-10 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <form onSubmit={handleSubmit} className="space-y-8">
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
              className="w-full h-14 rounded-2xl bg-gradient-to-r from-[#A855F7] via-[#6366F1] to-[#00E5FF] hover:opacity-90 text-white font-bold text-lg shadow-xl shadow-sky-500/10 transition-all active:scale-[0.98]"
            >
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <div className="flex items-center justify-center gap-2">
                  Entrar
                  <ArrowRight className="h-5 w-5" />
                </div>
              )}
            </Button>
            
            <div className="flex justify-center">
              <Link href="#" className="text-sm text-zinc-600 hover:text-white transition-colors">
                Esqueceu a senha?
              </Link>
            </div>
          </form>
        </div>

        <div className="mt-10 text-center">
          <p className="text-sm text-zinc-500">
            Não tem uma conta?{" "}
            <Link 
              href="/register" 
              className="text-sky-400 font-semibold hover:text-sky-300 transition-colors"
            >
              Criar conta gratuita
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
