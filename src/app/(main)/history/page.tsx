"use client"

import { useState, useEffect } from "react"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Download, Calendar as CalendarIcon, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

interface Subject {
  id: string
  name: string
  color: string
}

interface Session {
  id: string
  subject: { name: string, color: string }
  subjectId: string
  startTime: Date
  duration: number
  manual: boolean
  type?: string
}

export default function HistoryPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [subjectFilter, setSubjectFilter] = useState<string>("all")

  // Manual Entry State
  const [isManualOpen, setIsManualOpen] = useState(false)
  const [manualSubject, setManualSubject] = useState("")
  const [manualDate, setManualDate] = useState("")
  const [manualHours, setManualHours] = useState("0")
  const [manualMins, setManualMins] = useState("0")
  const [manualType, setManualType] = useState("Estudo")
  const [scheduleReview, setScheduleReview] = useState("0")

  const fetchSessions = async () => {
    try {
      const response = await fetch("/api/sessions")
      const data = await response.json()
      const formattedData = data.map((s: any) => ({
        ...s,
        startTime: new Date(s.startTime)
      }))
      setSessions(formattedData)
    } catch (error) {
      toast.error("Erro ao carregar histórico")
    } finally {
      setLoading(false)
    }
  }

  const fetchSubjects = async () => {
    try {
      const response = await fetch("/api/subjects")
      const data = await response.json()
      setSubjects(data)
    } catch (error) {
      console.error("Erro ao buscar matérias", error)
    }
  }

  useEffect(() => {
    fetchSessions()
    fetchSubjects()
  }, [])

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    return `${hrs}h ${mins}m`
  }

  const handleDeleteSession = async (id: string) => {
    if (confirm("Tem certeza que deseja apagar este registro de estudo?")) {
      try {
        const response = await fetch(`/api/sessions/${id}`, { method: "DELETE" })
        if (response.ok) {
          toast.success("Sessão excluída.")
          fetchSessions()
        } else {
          toast.error("Erro ao excluir")
        }
      } catch (error) {
        toast.error("Erro de conexão")
      }
    }
  }

  const handleExportCSV = () => {
    if (sessions.length === 0) {
      toast.error("Não há dados para exportar.")
      return
    }
    
    let csv = "Data,Matéria,Duração (min),Tipo,Registro\n"
    sessions.forEach(s => {
      const data = format(s.startTime, "dd/MM/yyyy")
      const min = Math.floor(s.duration / 60)
      const tipoRegistro = s.manual ? "Manual" : "Cronômetro"
      const tipoEstudo = s.type || "Estudo"
      csv += `${data},"${s.subject.name}",${min},"${tipoEstudo}",${tipoRegistro}\n`
    })

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.setAttribute("download", "historico_de_estudos.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success("Download iniciado!")
  }

  const handleManualSubmit = async () => {
    if (!manualSubject || !manualDate) {
      toast.error("Preencha matéria e data.")
      return
    }
    const h = parseInt(manualHours) || 0
    const m = parseInt(manualMins) || 0
    const totalSeconds = (h * 3600) + (m * 60)
    
    if (totalSeconds === 0) {
      toast.error("A duração não pode ser zero.")
      return
    }

    // Criar data baseada no input type="date"
    const [year, month, day] = manualDate.split("-").map(Number)
    const dateObj = new Date(year, month - 1, day, 12, 0, 0) // Meio-dia para evitar problemas de fuso

    try {
      const response = await fetch("/api/sessions", {
        method: "POST",
        body: JSON.stringify({
          subjectId: manualSubject,
          startTime: dateObj,
          endTime: new Date(dateObj.getTime() + totalSeconds * 1000),
          duration: totalSeconds,
          manual: true,
          type: manualType,
          scheduleReview: scheduleReview !== "0" ? parseInt(scheduleReview) : null
        }),
        headers: { "Content-Type": "application/json" }
      })

      if (response.ok) {
        toast.success("Estudo registrado!")
        setIsManualOpen(false)
        setManualSubject("")
        setManualHours("0")
        setManualMins("0")
        setManualType("Estudo")
        setScheduleReview("0")
        fetchSessions()
      } else {
        toast.error("Erro ao salvar")
      }
    } catch (error) {
      toast.error("Erro de conexão")
    }
  }

  // Filtragem local
  const filteredSessions = subjectFilter === "all" 
    ? sessions 
    : sessions.filter(s => s.subjectId === subjectFilter)

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Histórico de Estudos</h2>
          <p className="text-sm md:text-base text-muted-foreground">Veja todos os seus registros passados.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={handleExportCSV} className="flex-1 sm:flex-none">
            <Download className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Exportar CSV</span>
            <span className="sm:hidden">CSV</span>
          </Button>
          
          <Dialog open={isManualOpen} onOpenChange={setIsManualOpen}>
            <DialogTrigger className="flex-1 sm:flex-none inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-sky-600 text-primary-foreground shadow hover:bg-sky-700 h-9 px-4 py-2">
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Lançamento Manual</span>
              <span className="sm:hidden">Lançar</span>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Registrar Estudo Manual</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Matéria</label>
                  <Select onValueChange={(val) => setManualSubject(val || "")} value={manualSubject}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma matéria">
                        {manualSubject ? subjects.find(s => s.id === manualSubject)?.name : "Selecione"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map(sub => (
                        <SelectItem key={sub.id} value={sub.id}>{sub.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Data</label>
                    <Input type="date" value={manualDate} onChange={e => setManualDate(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tipo de Estudo</label>
                    <Select onValueChange={(val) => setManualType(val || "Estudo")} value={manualType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Estudo">Estudo (Geral)</SelectItem>
                        <SelectItem value="Leitura">Leitura</SelectItem>
                        <SelectItem value="Vídeo Aula">Vídeo Aula</SelectItem>
                        <SelectItem value="Atividades">Atividades / Exercícios</SelectItem>
                        <SelectItem value="Revisão">Revisão</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Horas</label>
                    <Input type="number" min="0" value={manualHours} onChange={e => setManualHours(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Minutos</label>
                    <Input type="number" min="0" max="59" value={manualMins} onChange={e => setManualMins(e.target.value)} />
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t mt-4">
                  <label className="text-sm font-medium">Agendar Revisão (Spaced Repetition)</label>
                  <Select onValueChange={(val) => setScheduleReview(val || "0")} value={scheduleReview}>
                    <SelectTrigger>
                      <SelectValue placeholder="Não agendar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Não agendar</SelectItem>
                      <SelectItem value="1">Amanhã (1 dia)</SelectItem>
                      <SelectItem value="3">Em 3 dias</SelectItem>
                      <SelectItem value="7">Em 1 semana</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsManualOpen(false)}>Cancelar</Button>
                <Button onClick={handleManualSubmit}>Salvar Registro</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

        </div>
      </div>

      <div className="grid gap-4 grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">Total de Sessões</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{sessions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">Média Diária</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">--</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">Dia Mais Produtivo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">--</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">Sessões Exibidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{filteredSessions.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <CardTitle>Logs Recentes</CardTitle>
          <div className="w-full sm:w-[200px]">
            <Select value={subjectFilter} onValueChange={(val) => setSubjectFilter(val || "all")}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar matéria">
                  {subjectFilter === "all" ? "Todas as matérias" : subjects.find(s => s.id === subjectFilter)?.name}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as matérias</SelectItem>
                {subjects.map(s => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 sm:pt-0">
          <div className="overflow-x-auto">
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Matéria</TableHead>
                <TableHead>Duração</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSessions.map((session) => (
                <TableRow key={session.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                      {format(session.startTime, "dd 'de' MMM, yyyy", { locale: ptBR })}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <div className="flex items-center">
                        <div 
                          className="h-3 w-3 rounded-full mr-2" 
                          style={{ backgroundColor: session.subject.color }}
                        />
                        <span className="font-medium">{session.subject.name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground mt-0.5 ml-5">{session.type || "Estudo"}</span>
                    </div>
                  </TableCell>
                  <TableCell>{Math.floor(session.duration / 3600)}h {Math.floor((session.duration % 3600) / 60)}m</TableCell>
                  <TableCell>
                    {session.manual ? (
                      <Badge variant="secondary" className="text-xs font-normal">Manual</Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs font-normal border-green-500/30 text-green-600">Cronômetro</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 w-8"
                      onClick={() => handleDeleteSession(session.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredSessions.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                    Nenhum log de estudo encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
