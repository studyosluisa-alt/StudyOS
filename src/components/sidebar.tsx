"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  BookOpen, 
  History, 
  Timer, 
  Settings,
  Moon,
  Sun,
  LogOut,
  Shield
} from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { signOut, useSession } from "next-auth/react"

const routes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
    color: "text-sky-500",
  },
  {
    label: "Cronômetro",
    icon: Timer,
    href: "/timer",
    color: "text-violet-500",
  },
  {
    label: "Matérias",
    icon: BookOpen,
    href: "/subjects",
    color: "text-pink-700",
  },
  {
    label: "Histórico",
    icon: History,
    href: "/history",
    color: "text-orange-700",
  },
  {
    label: "Configurações",
    icon: Settings,
    href: "/settings",
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { setTheme, theme } = useTheme()
  const { data: session } = useSession()
  const isAdmin = (session?.user as any)?.role === "ADMIN"

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-[#111827] text-white">
      <div className="px-3 py-2 flex-1">
        <Link href="/dashboard" className="flex items-center pl-3 mb-14">
          <h1 className="text-2xl font-bold">
            Study<span className="text-sky-500">OS</span>
          </h1>
        </Link>
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                pathname === route.href ? "text-white bg-white/10" : "text-zinc-400"
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                {route.label}
              </div>
            </Link>
          ))}
          
          {isAdmin && (
            <Link
              href="/admin/users"
              className={cn(
                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-rose-500/10 rounded-lg transition mt-4",
                pathname === "/admin/users" ? "text-rose-500 bg-rose-500/10" : "text-rose-400/70"
              )}
            >
              <div className="flex items-center flex-1">
                <Shield className="h-5 w-5 mr-3 text-rose-500" />
                Usuários (Admin)
              </div>
            </Link>
          )}
        </div>
      </div>
      <div className="px-3 py-2 space-y-2 border-t border-white/10 pt-4">
        <Button 
          variant="ghost" 
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="w-full justify-start text-zinc-400 hover:text-white hover:bg-white/10"
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5 mr-3" />
          ) : (
            <Moon className="h-5 w-5 mr-3" />
          )}
          <span>Mudar Tema</span>
        </Button>
        <Button 
          variant="ghost" 
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full justify-start text-zinc-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
        >
          <LogOut className="h-5 w-5 mr-3" />
          <span>Sair da Conta</span>
        </Button>
      </div>
    </div>
  )
}
