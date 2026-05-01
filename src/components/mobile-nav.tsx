"use client"

import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Sidebar } from "@/components/sidebar"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"

import { Logo } from "@/components/logo"

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  // Close the mobile nav when the route changes
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  return (
    <div className="md:hidden flex items-center justify-between w-full p-4 border-b bg-background z-50">
      <div className="flex items-center gap-2">
        <Logo className="h-10 w-28" />
      </div>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 w-9 md:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle Menu</span>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 bg-[#111827] border-r-0 w-72">
          {/* Adicionando título para acessibilidade */}
          <div className="sr-only">
            <SheetTitle>Menu de Navegação</SheetTitle>
            <SheetDescription>Navegue pelo StudyOS</SheetDescription>
          </div>
          <Sidebar />
        </SheetContent>
      </Sheet>
    </div>
  )
}
