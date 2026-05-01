"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  User, 
  Palette,
  Cloud
} from "lucide-react"
import { useTheme } from "next-themes"
import { useState } from "react"
import { toast } from "sonner"

export default function SettingsPage() {
  const { setTheme, theme } = useTheme()
  const [name, setName] = useState("Luciano Peixoto")

  const handleSaveProfile = () => {
    // In a real app, this would hit an API endpoint to update the user record
    toast.success("Perfil atualizado com sucesso!")
  }

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Configurações</h2>
        <p className="text-sm md:text-base text-muted-foreground">Gerencie suas preferências e conta.</p>
      </div>

      <div className="grid gap-6">
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
            <Button onClick={handleSaveProfile} className="w-full sm:w-auto">Salvar Alterações</Button>
          </CardContent>
        </Card>

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

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Cloud className="h-5 w-5 text-blue-500" />
              <CardTitle>Sincronização Cloud</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">O projeto está configurado para rodar na Oracle Cloud.</p>
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg w-full">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-sm font-medium truncate">Status: Conectado</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
