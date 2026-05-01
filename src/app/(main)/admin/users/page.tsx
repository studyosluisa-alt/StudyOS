"use client"

import { useState, useEffect } from "react"
import { Users, Shield, Key, Search, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"

interface User {
  id: string
  name: string
  email: string
  role: string
  _count: {
    subjects: number
  }
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [newPassword, setNewPassword] = useState("")
  const [isResetOpen, setIsResetOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users")
      if (!response.ok) throw new Error("Acesso negado")
      const data = await response.json()
      setUsers(data)
    } catch (error) {
      toast.error("Você não tem permissão de administrador")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleResetPassword = async () => {
    if (!selectedUser || !newPassword) return
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}/reset-password`, {
        method: "PATCH",
        body: JSON.stringify({ newPassword }),
        headers: { "Content-Type": "application/json" }
      })

      if (response.ok) {
        toast.success(`Senha de ${selectedUser.name} alterada com sucesso!`)
        setIsResetOpen(false)
        setNewPassword("")
      } else {
        const data = await response.json()
        toast.error(data.error || "Erro ao resetar senha")
      }
    } catch (error) {
      toast.error("Erro na conexão")
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(search.toLowerCase()) || 
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 space-y-8">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Shield className="h-8 w-8 text-rose-500" />
          <h1 className="text-3xl font-bold tracking-tight">Painel do Administrador</h1>
        </div>
        <p className="text-muted-foreground">Gerencie usuários e segurança da plataforma.</p>
      </div>

      <div className="flex items-center bg-muted/50 rounded-lg px-3 py-2 max-w-md border border-white/10 backdrop-blur-sm">
        <Search className="h-4 w-4 text-muted-foreground mr-2" />
        <Input 
          placeholder="Buscar por nome ou e-mail..." 
          className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid gap-6">
        {filteredUsers.map((user) => (
          <Card key={user.id} className="overflow-hidden border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/10 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                    {user.name?.charAt(0) || user.email?.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">{user.name}</h3>
                      {user.role === "ADMIN" && (
                        <Badge variant="secondary" className="bg-rose-500/10 text-rose-500 border-rose-500/20">
                          Admin
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-4">
                  <div className="text-sm text-muted-foreground px-4 py-1 rounded-full bg-white/5 border border-white/5">
                    <span className="font-semibold text-sky-500">{user._count.subjects}</span> Matérias
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-white/10 hover:bg-rose-500/10 hover:text-rose-500 transition-colors"
                    onClick={() => {
                      setSelectedUser(user)
                      setIsResetOpen(true)
                    }}
                  >
                    <Key className="h-4 w-4 mr-2" />
                    Resetar Senha
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isResetOpen} onOpenChange={setIsResetOpen}>
        <DialogContent className="bg-[#111827] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-sky-500" />
              Alterar Senha de {selectedUser?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="py-6 space-y-4">
            <p className="text-sm text-zinc-400">
              Digite a nova senha para este usuário. Ele poderá entrar imediatamente após a alteração.
            </p>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Nova Senha</label>
              <Input 
                type="password"
                placeholder="Mínimo 6 caracteres"
                className="bg-black/20 border-white/10 text-white focus:border-sky-500 transition-all"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsResetOpen(false)} className="text-zinc-400">
              Cancelar
            </Button>
            <Button 
              className="bg-sky-600 hover:bg-sky-700 text-white shadow-lg shadow-sky-500/20"
              onClick={handleResetPassword}
              disabled={isSubmitting || newPassword.length < 6}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : "Confirmar Alteração"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
