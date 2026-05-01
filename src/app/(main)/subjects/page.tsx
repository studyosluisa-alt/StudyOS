"use client"

import { useState, useEffect } from "react"
import { Plus, Pencil, Trash2, Search, BookOpen } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

interface Subject {
  id: string
  name: string
  color: string
}

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  
  // Create state
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [newName, setNewName] = useState("")
  const [newColor, setNewColor] = useState("#3b82f6")

  // Edit state
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null)

  const fetchSubjects = async () => {
    try {
      const response = await fetch("/api/subjects")
      const data = await response.json()
      setSubjects(data)
    } catch (error) {
      toast.error("Erro ao carregar matérias")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSubjects()
  }, [])

  const filteredSubjects = subjects.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleAddSubject = async () => {
    if (!newName) return
    try {
      const response = await fetch("/api/subjects", {
        method: "POST",
        body: JSON.stringify({ name: newName, color: newColor }),
        headers: { "Content-Type": "application/json" }
      })

      if (response.ok) {
        toast.success("Matéria adicionada com sucesso!")
        setNewName("")
        setIsAddOpen(false)
        fetchSubjects()
      }
    } catch (error) {
      toast.error("Erro ao salvar matéria")
    }
  }

  const openEditModal = (subject: Subject) => {
    setEditingSubject(subject)
    setNewName(subject.name)
    setNewColor(subject.color)
    setIsEditOpen(true)
  }

  const handleEditSubject = async () => {
    if (!editingSubject || !newName) return
    try {
      const response = await fetch(`/api/subjects/${editingSubject.id}`, {
        method: "PATCH",
        body: JSON.stringify({ name: newName, color: newColor }),
        headers: { "Content-Type": "application/json" }
      })

      if (response.ok) {
        toast.success("Matéria atualizada!")
        setNewName("")
        setIsEditOpen(false)
        setEditingSubject(null)
        fetchSubjects()
      } else {
        toast.error("Erro ao atualizar")
      }
    } catch (error) {
      toast.error("Erro ao atualizar matéria")
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta matéria? Todas as sessões de estudo ligadas a ela também serão excluídas.")) {
      try {
        const response = await fetch(`/api/subjects/${id}`, {
          method: "DELETE"
        })
        if (response.ok) {
          toast.success("Matéria excluída.")
          fetchSubjects()
        } else {
          toast.error("Erro ao excluir matéria")
        }
      } catch (error) {
        toast.error("Erro ao excluir matéria")
      }
    }
  }

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Matérias</h2>
          <p className="text-sm md:text-base text-muted-foreground">Gerencie as disciplinas que você estuda.</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={(open) => {
          setIsAddOpen(open)
          if (open) {
            setNewName("")
            setNewColor("#3b82f6")
          }
        }}>
          <DialogTrigger className="w-full sm:w-auto inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-sky-600 text-primary-foreground shadow hover:bg-sky-700 h-9 px-4 py-2">
            <Plus className="h-4 w-4 mr-2" />
            Nova Matéria
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Nova Matéria</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nome</label>
                <Input 
                  placeholder="Ex: Direito Administrativo" 
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Cor</label>
                <div className="flex gap-2 flex-wrap">
                  {["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#6366f1", "#14b8a6"].map(c => (
                    <button
                      key={c}
                      className={`h-8 w-8 rounded-full border-2 transition ${newColor === c ? "border-black scale-110" : "border-transparent"}`}
                      style={{ backgroundColor: c }}
                      onClick={() => setNewColor(c)}
                    />
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancelar</Button>
              <Button onClick={handleAddSubject}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center bg-muted/50 rounded-lg px-3 py-2 max-w-md">
        <Search className="h-4 w-4 text-muted-foreground mr-2" />
        <Input 
          placeholder="Buscar matérias..." 
          className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredSubjects.map((subject) => (
          <Card key={subject.id} className="overflow-hidden group">
            <div 
              className="h-2 w-full" 
              style={{ backgroundColor: subject.color }} 
            />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <Link href={`/subjects/${subject.id}`} className="hover:underline decoration-sky-500 underline-offset-4">
                <CardTitle className="text-lg font-bold">{subject.name}</CardTitle>
              </Link>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => openEditModal(subject)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={() => handleDelete(subject.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="flex flex-col gap-4 mt-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs font-normal">
                    Ativa
                  </Badge>
                </div>
                <Link 
                  href={`/subjects/${subject.id}`} 
                  className="inline-flex w-full items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground hover:bg-secondary/80 h-9 px-4 py-2"
                >
                  <BookOpen className="w-4 h-4 mr-2 text-sky-500" />
                  Abrir Área da Matéria
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
        {filteredSubjects.length === 0 && !loading && (
          <div className="col-span-full text-center py-10 text-muted-foreground">
            Nenhuma matéria encontrada.
          </div>
        )}
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Matéria</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome</label>
              <Input 
                placeholder="Ex: Direito Administrativo" 
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Cor</label>
              <div className="flex gap-2 flex-wrap">
                {["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#6366f1", "#14b8a6"].map(c => (
                  <button
                    key={c}
                    className={`h-8 w-8 rounded-full border-2 transition ${newColor === c ? "border-black scale-110" : "border-transparent"}`}
                    style={{ backgroundColor: c }}
                    onClick={() => setNewColor(c)}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancelar</Button>
            <Button onClick={handleEditSubject}>Atualizar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
