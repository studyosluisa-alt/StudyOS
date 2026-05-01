"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  User, 
  Palette,
  Cloud,
  ShieldCheck,
  Loader2,
  Info
} from "lucide-react"
import { useTheme } from "next-themes"
import { useState } from "react"
import { toast } from "sonner"

export default function SettingsPage() {
  const { setTheme, theme } = useTheme()
  const [name, setName] = useState("Luciano Peixoto")
  
  // Password change states
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSaveProfile = () => {
    toast.success("Perfil atualizado com sucesso!")
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (newPassword !== confirmPassword) {
      return toast.error("As novas senhas não coincidem")
    }

    setLoading(true)

    try {
      const res = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      })

      const message = await res.text()

      if (res.ok) {
        toast.success("Senha alterada com sucesso!")
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
      } else {
        toast.error(message || "Erro ao alterar senha")
      }
    } catch (error) {
      toast.error("Ocorreu um erro inesperado")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8 max-w-5xl mx-auto">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Configurações</h2>
        <p className="text-sm md:text-base text-muted-foreground">Gerencie suas preferências e conta.</p>
      </div>

      <div className="grid gap-6">
        {/* Profile Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
               <User className="h-5 w-5 text-sky-500" />
               <CardTitle>Perfil</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nome de Exibição</label>
                <Input 
                  value={name}
                  onChange={(e) => setName(e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">E-mail</label>
                <Input value="email@exemplo.com" disabled />
              </div>
            </div>
            <Button onClick={handleSaveProfile} className="w-full sm:w-auto bg-sky-600 hover:bg-sky-700">Salvar Alterações</Button>
          </CardContent>
        </Card>

        {/* Security Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-purple-500" />
              <CardTitle>Segurança</CardTitle>
            </div>
            <CardDescription>
              Atualize sua senha periodicamente para manter sua conta protegida.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Senha Atual</label>
                  <Input 
                    type="password" 
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nova Senha</label>
                  <Input 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Confirmar Nova Senha</label>
                  <Input 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg border border-border flex gap-3 items-start">
                <Info className="h-5 w-5 text-purple-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Requisitos de Segurança</p>
                  <ul className="text-xs text-muted-foreground grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 list-disc list-inside">
                    <li>Mínimo de 8 caracteres</li>
                    <li>Pelo menos uma letra maiúscula</li>
                    <li>Pelo menos um número</li>
                    <li>Pelo menos um caractere especial (!@#$%)</li>
                  </ul>
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700">
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Atualizar Senha
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Appearance Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-pink-500" />
              <CardTitle>Aparência</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Personalize o visual do seu dashboard.</p>
            <div className="flex flex-wrap gap-2 sm:gap-4">
              <Button 
                variant={theme === 'light' ? "default" : "outline"} 
                onClick={() => setTheme("light")}
                className="flex-1 sm:flex-none"
              >
                Claro
              </Button>
              <Button 
                variant={theme === 'dark' ? "default" : "outline"} 
                onClick={() => setTheme("dark")}
                className="flex-1 sm:flex-none"
              >
                Escuro
              </Button>
              <Button 
                variant={theme === 'system' ? "default" : "outline"} 
                onClick={() => setTheme("system")}
                className="flex-1 sm:flex-none"
              >
                Sistema
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sync Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Cloud className="h-5 w-5 text-blue-500" />
              <CardTitle>Infraestrutura</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Status da sua instância do StudyOS.</p>
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg w-full">
              <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
              <span className="text-sm font-medium truncate">Oracle Cloud: Operacional</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
